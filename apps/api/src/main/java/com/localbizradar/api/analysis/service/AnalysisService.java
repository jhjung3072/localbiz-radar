package com.localbizradar.api.analysis.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.localbizradar.api.analysis.dto.AnalysisCondition;
import com.localbizradar.api.analysis.dto.AnalysisSummaryRequest;
import com.localbizradar.api.analysis.dto.AnalysisSummaryResponse;
import com.localbizradar.api.analysis.dto.CategoryDepth;
import com.localbizradar.api.analysis.dto.CategoryDistributionItemResponse;
import com.localbizradar.api.analysis.dto.CategoryDistributionRequest;
import com.localbizradar.api.analysis.dto.CompareAnalysisRequest;
import com.localbizradar.api.analysis.dto.CompareAnalysisResponse;
import com.localbizradar.api.analysis.dto.CompareAreaResponse;
import com.localbizradar.api.analysis.dto.CompareWinnerResponse;
import com.localbizradar.api.analysis.dto.CompetitionRequest;
import com.localbizradar.api.analysis.dto.CompetitionResponse;
import com.localbizradar.api.analysis.repository.AnalysisStoreSpecifications;
import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.repository.StoreRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class AnalysisService {

	private static final double EARTH_RADIUS_METERS = 6_371_000.0;

	private final StoreRepository storeRepository;

	public AnalysisService(StoreRepository storeRepository) {
		this.storeRepository = storeRepository;
	}

	public AnalysisSummaryResponse getSummary(AnalysisSummaryRequest request) {
		return summarize(request.toCondition());
	}

	public List<CategoryDistributionItemResponse> getCategoryDistribution(CategoryDistributionRequest request) {
		List<Store> stores = findStores(request.toCondition());
		long totalStores = stores.size();

		if (totalStores == 0) {
			return List.of();
		}

		Map<CategoryKey, Long> groupedStores = stores.stream()
				.collect(Collectors.groupingBy(store -> categoryKey(store, request.getDepth()), Collectors.counting()));

		return groupedStores.entrySet().stream()
				.map(entry -> new CategoryDistributionItemResponse(
						entry.getKey().code(),
						entry.getKey().name(),
						entry.getValue(),
						round(entry.getValue() * 100.0 / totalStores)))
				.sorted(Comparator
						.comparingLong(CategoryDistributionItemResponse::storeCount)
						.reversed()
						.thenComparing(CategoryDistributionItemResponse::categoryName))
				.toList();
	}

	public CompetitionResponse getCompetition(CompetitionRequest request) {
		List<Store> areaStores = findCompetitionAreaStores(request);
		List<Store> sameCategoryStores = areaStores.stream()
				.filter(store -> matchesCategory(store, request.toCategoryCondition()))
				.toList();
		long totalStoresInArea = areaStores.size();
		long sameCategoryStoreCount = sameCategoryStores.size();
		double competitionIndex = totalStoresInArea == 0
				? 0
				: round(sameCategoryStoreCount * 100.0 / totalStoresInArea);

		return new CompetitionResponse(
				sameCategoryStoreCount,
				sameCategoryStoreCount,
				totalStoresInArea,
				competitionIndex,
				request.getRadius(),
				"meter",
				buildCompetitionMessage(request, totalStoresInArea, sameCategoryStoreCount));
	}

	public CompareAnalysisResponse compare(CompareAnalysisRequest request) {
		AnalysisSummaryResponse baseSummary = summarize(request.base().toCondition());
		AnalysisSummaryResponse targetSummary = summarize(request.target().toCondition());
		CompareAreaResponse base = CompareAreaResponse.from(baseSummary);
		CompareAreaResponse target = CompareAreaResponse.from(targetSummary);

		return new CompareAnalysisResponse(base, target, decideWinner(base, target));
	}

	private AnalysisSummaryResponse summarize(AnalysisCondition condition) {
		List<Store> stores = findStores(condition);
		long totalStores = stores.size();
		long totalCategories = countDistinct(stores, Store::getCategorySmallCode);
		CategoryCount topCategory = findTopCategory(stores);
		double competitionIndex = calculateCompetitionIndex(totalStores, topCategory.count());
		double diversityScore = calculateDiversityScore(totalStores, totalCategories);
		double localBizScore = calculateLocalBizScore(totalStores, competitionIndex, diversityScore);

		return new AnalysisSummaryResponse(
				totalStores,
				totalCategories,
				topCategory.name(),
				competitionIndex,
				diversityScore,
				localBizScore,
				buildRegionLabel(condition),
				buildCategoryLabel(condition, stores));
	}

	private List<Store> findStores(AnalysisCondition condition) {
		return storeRepository.findAll(
				AnalysisStoreSpecifications.byCondition(condition),
				Sort.by("sido").ascending()
						.and(Sort.by("sigungu").ascending())
						.and(Sort.by("dong").ascending())
						.and(Sort.by("storeName").ascending()));
	}

	private List<Store> findCompetitionAreaStores(CompetitionRequest request) {
		if (request.hasRegion()) {
			return findStores(request.toRegionCondition());
		}

		List<Store> stores = findStores(new AnalysisCondition(null, null, null, null, null, null));
		if (!request.hasCoordinateSearch()) {
			return stores;
		}

		return stores.stream()
				.filter(store -> isWithinRadius(store, request.getLat(), request.getLng(), request.getRadius()))
				.toList();
	}

	private boolean isWithinRadius(Store store, double lat, double lng, int radius) {
		if (store.getLatitude() == null || store.getLongitude() == null) {
			return false;
		}

		return haversineDistanceMeters(
				lat,
				lng,
				store.getLatitude().doubleValue(),
				store.getLongitude().doubleValue()) <= radius;
	}

	private double haversineDistanceMeters(double lat1, double lng1, double lat2, double lng2) {
		double latDistance = Math.toRadians(lat2 - lat1);
		double lngDistance = Math.toRadians(lng2 - lng1);
		double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
				+ Math.cos(Math.toRadians(lat1))
				* Math.cos(Math.toRadians(lat2))
				* Math.sin(lngDistance / 2)
				* Math.sin(lngDistance / 2);

		return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	}

	private boolean matchesCategory(Store store, AnalysisCondition condition) {
		if (StringUtils.hasText(condition.categorySmallCode())) {
			return Objects.equals(store.getCategorySmallCode(), condition.categorySmallCode().trim());
		}
		if (StringUtils.hasText(condition.categoryMediumCode())) {
			return Objects.equals(store.getCategoryMediumCode(), condition.categoryMediumCode().trim());
		}
		if (StringUtils.hasText(condition.categoryLargeCode())) {
			return Objects.equals(store.getCategoryLargeCode(), condition.categoryLargeCode().trim());
		}

		return true;
	}

	private long countDistinct(List<Store> stores, Function<Store, String> mapper) {
		return stores.stream()
				.map(mapper)
				.filter(StringUtils::hasText)
				.distinct()
				.count();
	}

	private CategoryCount findTopCategory(List<Store> stores) {
		return stores.stream()
				.collect(Collectors.groupingBy(Store::getCategorySmallName, Collectors.counting()))
				.entrySet()
				.stream()
				.map(entry -> new CategoryCount(entry.getKey(), entry.getValue()))
				.sorted(Comparator
						.comparingLong(CategoryCount::count)
						.reversed()
						.thenComparing(CategoryCount::name))
				.findFirst()
				.orElse(new CategoryCount("-", 0));
	}

	private double calculateCompetitionIndex(long totalStores, long topCategoryCount) {
		if (totalStores == 0) {
			return 0;
		}

		return round(Math.min(100, topCategoryCount * 100.0 / totalStores));
	}

	private double calculateDiversityScore(long totalStores, long totalCategories) {
		if (totalStores == 0) {
			return 0;
		}

		return round(Math.min(100, totalCategories * 100.0 / totalStores));
	}

	private double calculateLocalBizScore(long totalStores, double competitionIndex, double diversityScore) {
		if (totalStores == 0) {
			return 0;
		}

		double volumeScore = Math.min(100, totalStores * 8.0);
		return round(Math.min(100, volumeScore * 0.35 + diversityScore * 0.35 + (100 - competitionIndex) * 0.30));
	}

	private CategoryKey categoryKey(Store store, CategoryDepth depth) {
		return switch (depth) {
			case LARGE -> new CategoryKey(store.getCategoryLargeCode(), store.getCategoryLargeName());
			case MEDIUM -> new CategoryKey(store.getCategoryMediumCode(), store.getCategoryMediumName());
			case SMALL -> new CategoryKey(store.getCategorySmallCode(), store.getCategorySmallName());
		};
	}

	private String buildRegionLabel(AnalysisCondition condition) {
		return Stream.of(condition.sido(), condition.sigungu(), condition.dong())
				.filter(StringUtils::hasText)
				.map(String::trim)
				.collect(Collectors.collectingAndThen(Collectors.joining(" "), label -> label.isBlank() ? "전체 지역" : label));
	}

	private String buildCategoryLabel(AnalysisCondition condition, List<Store> stores) {
		if (!StringUtils.hasText(condition.categoryLargeCode())
				&& !StringUtils.hasText(condition.categoryMediumCode())
				&& !StringUtils.hasText(condition.categorySmallCode())) {
			return "전체 업종";
		}

		return stores.stream()
				.findFirst()
				.map(store -> {
					if (StringUtils.hasText(condition.categorySmallCode())) {
						return store.getCategorySmallName();
					}
					if (StringUtils.hasText(condition.categoryMediumCode())) {
						return store.getCategoryMediumName();
					}
					return store.getCategoryLargeName();
				})
				.orElseGet(() -> Stream.of(
								condition.categorySmallCode(),
								condition.categoryMediumCode(),
								condition.categoryLargeCode())
						.filter(StringUtils::hasText)
						.findFirst()
						.orElse("선택 업종"));
	}

	private CompareWinnerResponse decideWinner(CompareAreaResponse base, CompareAreaResponse target) {
		int comparison = Double.compare(base.localBizScore(), target.localBizScore());
		if (comparison == 0) {
			return new CompareWinnerResponse(
					"동률",
					"두 후보 지역의 LocalBiz 점수가 동일합니다.");
		}

		CompareAreaResponse winner = comparison > 0 ? base : target;
		CompareAreaResponse other = comparison > 0 ? target : base;
		String reason = String.format(
				Locale.KOREAN,
				"%s의 LocalBiz 점수가 %.1f점으로 %s보다 %.1f점 높습니다.",
				winner.regionLabel(),
				winner.localBizScore(),
				other.regionLabel(),
				Math.abs(winner.localBizScore() - other.localBizScore()));

		return new CompareWinnerResponse(winner.regionLabel(), reason);
	}

	private String buildCompetitionMessage(CompetitionRequest request, long totalStoresInArea, long sameCategoryStoreCount) {
		if (totalStoresInArea == 0) {
			return "선택 조건에 해당하는 점포 데이터가 없습니다.";
		}

		if (request.hasRegion()) {
			return "지역 조건을 우선 적용해 경쟁 점포 수를 계산했습니다.";
		}

		if (request.hasCoordinateSearch()) {
			return "좌표와 반경을 기준으로 Haversine 근사 계산을 적용했습니다.";
		}

		if (sameCategoryStoreCount == totalStoresInArea) {
			return "업종 조건이 없어 전체 점포를 기준으로 계산했습니다.";
		}

		return "선택한 업종 조건을 기준으로 경쟁 점포 수를 계산했습니다.";
	}

	private double round(double value) {
		return BigDecimal.valueOf(value)
				.setScale(1, RoundingMode.HALF_UP)
				.doubleValue();
	}

	private record CategoryKey(String code, String name) {
	}

	private record CategoryCount(String name, long count) {
	}
}
