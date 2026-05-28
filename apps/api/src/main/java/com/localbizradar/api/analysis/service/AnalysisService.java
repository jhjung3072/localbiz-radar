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
import com.localbizradar.api.analysis.dto.MetricComparisonResponse;
import com.localbizradar.api.analysis.dto.RegionRankingGroupBy;
import com.localbizradar.api.analysis.dto.RegionRankingItemResponse;
import com.localbizradar.api.analysis.dto.RegionRankingRequest;
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
		AnalysisCondition categoryCondition = resolveCompareCategoryCondition(request);
		CompareAreaResponse base = buildCompareArea(request.base(), categoryCondition);
		CompareAreaResponse target = buildCompareArea(request.target(), categoryCondition);
		List<MetricComparisonResponse> metricComparisons = buildMetricComparisons(base, target);

		return new CompareAnalysisResponse(base, target, decideWinner(base, target), metricComparisons);
	}

	public List<RegionRankingItemResponse> getRegionRanking(RegionRankingRequest request) {
		List<Store> stores = storeRepository.findAll(Sort.by("sido").ascending()
				.and(Sort.by("sigungu").ascending())
				.and(Sort.by("dong").ascending())
				.and(Sort.by("storeName").ascending()));
		AnalysisCondition categoryCondition = request.toCategoryCondition();

		Map<RegionRankingKey, List<Store>> groupedStores = stores.stream()
				.filter(store -> matchesRankingScope(store, request))
				.collect(Collectors.groupingBy(
						store -> rankingKey(store, request.getGroupBy()),
						java.util.LinkedHashMap::new,
						Collectors.toList()));

		List<RegionRankingMetric> metrics = groupedStores.entrySet().stream()
				.map(entry -> buildRegionRankingMetric(entry.getKey(), entry.getValue(), categoryCondition))
				.sorted(Comparator
						.comparingDouble(RegionRankingMetric::localBizScore)
						.reversed()
						.thenComparing(Comparator.comparingLong(RegionRankingMetric::categoryStoreCount).reversed())
						.thenComparing(Comparator.comparingLong(RegionRankingMetric::totalStores).reversed())
						.thenComparing(RegionRankingMetric::regionLabel))
				.limit(request.getLimit())
				.toList();

		java.util.concurrent.atomic.AtomicInteger rank = new java.util.concurrent.atomic.AtomicInteger(1);
		return metrics.stream()
				.map(metric -> new RegionRankingItemResponse(
						rank.getAndIncrement(),
						metric.ctprvnCd(),
						metric.ctprvnNm(),
						metric.signguCd(),
						metric.signguNm(),
						metric.adongCd(),
						metric.adongNm(),
						metric.regionLabel(),
						metric.totalStores(),
						metric.categoryStoreCount(),
						metric.competitionIndex(),
						metric.categoryDiversityScore(),
						metric.densityScore(),
						metric.localBizScore()))
				.toList();
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

	private CompareAreaResponse buildCompareArea(
			com.localbizradar.api.analysis.dto.CompareAreaRequest area,
			AnalysisCondition categoryCondition
	) {
		AnalysisCondition regionCondition = new AnalysisCondition(
				area.getCtprvnCd(),
				hasText(area.getCtprvnNm()) ? area.getCtprvnNm() : area.getSido(),
				area.getSignguCd(),
				hasText(area.getSignguNm()) ? area.getSignguNm() : area.getSigungu(),
				area.getAdongCd(),
				hasText(area.getAdongNm()) ? area.getAdongNm() : area.getDong(),
				null,
				null,
				null);
		List<Store> regionStores = findStores(regionCondition);
		return buildCompareAreaResponse(buildRegionLabel(regionCondition), regionStores, categoryCondition);
	}

	private CompareAreaResponse buildCompareAreaResponse(
			String regionLabel,
			List<Store> regionStores,
			AnalysisCondition categoryCondition
	) {
		List<Store> categoryStores = regionStores.stream()
				.filter(store -> matchesCategory(store, categoryCondition))
				.toList();
		boolean hasCategoryFilter = hasCategoryFilter(categoryCondition);
		long totalStores = regionStores.size();
		long categoryStoreCount = hasCategoryFilter ? categoryStores.size() : totalStores;
		long totalCategories = countDistinct(regionStores, Store::getCategorySmallCode);
		List<Store> topCategorySource = hasCategoryFilter ? categoryStores : regionStores;
		CategoryCount topCategory = findTopCategory(topCategorySource);
		double categoryShare = totalStores == 0 ? 0 : round(categoryStoreCount * 100.0 / totalStores);
		double competitionIndex = hasCategoryFilter
				? categoryShare
				: calculateCompetitionIndex(totalStores, topCategory.count());
		double diversityScore = calculateDiversityScore(totalStores, totalCategories);
		double densityScore = calculateDensityScore(totalStores);
		double localBizScore = calculateLocalBizScore(densityScore, competitionIndex, diversityScore);
		List<CategoryDistributionItemResponse> topCategories = buildTopCategories(topCategorySource);

		return new CompareAreaResponse(
				regionLabel,
				totalStores,
				categoryStoreCount,
				categoryShare,
				totalCategories,
				topCategory.name(),
				competitionIndex,
				diversityScore,
				densityScore,
				localBizScore,
				topCategories);
	}

	private List<Store> findCompetitionAreaStores(CompetitionRequest request) {
		if (request.hasRegion()) {
			return findStores(request.toRegionCondition());
		}

		List<Store> stores = findStores(new AnalysisCondition(null, null, null, null, null, null, null, null, null));
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

	private boolean hasCategoryFilter(AnalysisCondition condition) {
		return StringUtils.hasText(condition.categoryLargeCode())
				|| StringUtils.hasText(condition.categoryMediumCode())
				|| StringUtils.hasText(condition.categorySmallCode());
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

	private List<CategoryDistributionItemResponse> buildTopCategories(List<Store> stores) {
		long totalStores = stores.size();
		if (totalStores == 0) {
			return List.of();
		}

		return stores.stream()
				.collect(Collectors.groupingBy(
						store -> new CategoryKey(store.getCategorySmallCode(), store.getCategorySmallName()),
						Collectors.counting()))
				.entrySet()
				.stream()
				.map(entry -> new CategoryDistributionItemResponse(
						entry.getKey().code(),
						entry.getKey().name(),
						entry.getValue(),
						round(entry.getValue() * 100.0 / totalStores)))
				.sorted(Comparator
						.comparingLong(CategoryDistributionItemResponse::storeCount)
						.reversed()
						.thenComparing(CategoryDistributionItemResponse::categoryName))
				.limit(5)
				.toList();
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

		return calculateLocalBizScore(calculateDensityScore(totalStores), competitionIndex, diversityScore);
	}

	private double calculateDensityScore(long totalStores) {
		return round(Math.min(100, totalStores * 8.0));
	}

	private double calculateLocalBizScore(double densityScore, double competitionIndex, double diversityScore) {
		if (densityScore == 0 && competitionIndex == 0 && diversityScore == 0) {
			return 0;
		}

		return round(Math.min(100, densityScore * 0.35 + diversityScore * 0.35 + (100 - competitionIndex) * 0.30));
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
					0,
					"두 후보 지역의 LocalBiz 점수가 동일합니다.");
		}

		CompareAreaResponse winner = comparison > 0 ? base : target;
		CompareAreaResponse other = comparison > 0 ? target : base;
		double scoreGap = round(Math.abs(winner.localBizScore() - other.localBizScore()));
		String reason = String.format(
				Locale.KOREAN,
				"%s의 LocalBiz 점수가 %.1f점으로 %s보다 %.1f점 높습니다. %s",
				winner.regionLabel(),
				winner.localBizScore(),
				other.regionLabel(),
				scoreGap,
				buildWinnerReason(winner, other));

		return new CompareWinnerResponse(winner.regionLabel(), scoreGap, reason);
	}

	private String buildWinnerReason(CompareAreaResponse winner, CompareAreaResponse other) {
		if (winner.categoryDiversityScore() > other.categoryDiversityScore()
				&& winner.densityScore() > other.densityScore()) {
			return "업종 다양성과 점포 밀도 점수가 더 높아 후보 지역으로 더 적합합니다.";
		}
		if (winner.categoryDiversityScore() > other.categoryDiversityScore()) {
			return "업종 다양성 점수가 더 높아 선택 업종 주변의 보완 업종 구성이 더 넓습니다.";
		}
		if (winner.densityScore() > other.densityScore()) {
			return "점포 밀도 점수가 더 높아 상권 활성도가 더 높게 나타납니다.";
		}
		if (winner.competitionIndex() < other.competitionIndex()) {
			return "경쟁 강도가 상대적으로 낮아 진입 부담이 더 작게 나타납니다.";
		}
		return "종합 점수 기준으로 더 안정적인 후보 지역입니다.";
	}

	private List<MetricComparisonResponse> buildMetricComparisons(CompareAreaResponse base, CompareAreaResponse target) {
		return List.of(
				metric("localBizScore", "LocalBiz 점수", base.localBizScore(), target.localBizScore()),
				metric("competitionIndex", "경쟁 강도", base.competitionIndex(), target.competitionIndex()),
				metric("categoryDiversityScore", "업종 다양성", base.categoryDiversityScore(), target.categoryDiversityScore()),
				metric("densityScore", "점포 밀도", base.densityScore(), target.densityScore()),
				metric("categoryShare", "선택 업종 비중", base.categoryShare(), target.categoryShare()),
				metric("totalStores", "총 점포 수", base.totalStores(), target.totalStores()));
	}

	private MetricComparisonResponse metric(String key, String name, double baseValue, double targetValue) {
		String winner = Double.compare(baseValue, targetValue) == 0
				? "TIE"
				: Double.compare(baseValue, targetValue) > 0 ? "BASE" : "TARGET";
		return new MetricComparisonResponse(key, name, baseValue, targetValue, winner);
	}

	private AnalysisCondition resolveCompareCategoryCondition(CompareAnalysisRequest request) {
		if (request.category() != null) {
			return request.category().toCondition();
		}

		return new AnalysisCondition(
				null,
				null,
				null,
				null,
				null,
				null,
				request.base().getCategoryLargeCode(),
				request.base().getCategoryMediumCode(),
				request.base().getCategorySmallCode());
	}

	private boolean matchesRankingScope(Store store, RegionRankingRequest request) {
		if (StringUtils.hasText(request.getCtprvnCd())
				&& !Objects.equals(normalizedSidoCode(store), request.getCtprvnCd().trim())) {
			return false;
		}
		return !StringUtils.hasText(request.getSignguCd())
				|| Objects.equals(normalizedSigunguCode(store), request.getSignguCd().trim());
	}

	private RegionRankingKey rankingKey(Store store, RegionRankingGroupBy groupBy) {
		if (groupBy == RegionRankingGroupBy.ADMIN_DONG) {
			return new RegionRankingKey(
					normalizedSidoCode(store),
					store.getSido(),
					normalizedSigunguCode(store),
					store.getSigungu(),
					normalizedAdminDongCode(store),
					store.getDong(),
					Stream.of(store.getSido(), store.getSigungu(), store.getDong())
							.filter(StringUtils::hasText)
							.collect(Collectors.joining(" ")));
		}

		return new RegionRankingKey(
				normalizedSidoCode(store),
				store.getSido(),
				normalizedSigunguCode(store),
				store.getSigungu(),
				null,
				null,
				Stream.of(store.getSido(), store.getSigungu())
						.filter(StringUtils::hasText)
						.collect(Collectors.joining(" ")));
	}

	private RegionRankingMetric buildRegionRankingMetric(
			RegionRankingKey key,
			List<Store> stores,
			AnalysisCondition categoryCondition
	) {
		CompareAreaResponse area = buildCompareAreaResponse(key.regionLabel(), stores, categoryCondition);
		return new RegionRankingMetric(
				key.ctprvnCd(),
				key.ctprvnNm(),
				key.signguCd(),
				key.signguNm(),
				key.adongCd(),
				key.adongNm(),
				key.regionLabel(),
				area.totalStores(),
				area.categoryStoreCount(),
				area.competitionIndex(),
				area.categoryDiversityScore(),
				area.densityScore(),
				area.localBizScore());
	}

	private String normalizedSidoCode(Store store) {
		if (StringUtils.hasText(store.getSidoCode())) {
			return store.getSidoCode();
		}
		if ("서울특별시".equals(store.getSido())) {
			return "11";
		}
		return null;
	}

	private String normalizedSigunguCode(Store store) {
		if (StringUtils.hasText(store.getSigunguCode())) {
			return store.getSigunguCode();
		}
		return switch (store.getSigungu()) {
			case "강남구" -> "11680";
			case "마포구" -> "11440";
			case "성동구" -> "11200";
			default -> null;
		};
	}

	private String normalizedAdminDongCode(Store store) {
		return StringUtils.hasText(store.getAdminDongCode()) ? store.getAdminDongCode() : null;
	}

	private boolean hasText(String value) {
		return StringUtils.hasText(value);
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

	private record RegionRankingKey(
			String ctprvnCd,
			String ctprvnNm,
			String signguCd,
			String signguNm,
			String adongCd,
			String adongNm,
			String regionLabel
	) {
	}

	private record RegionRankingMetric(
			String ctprvnCd,
			String ctprvnNm,
			String signguCd,
			String signguNm,
			String adongCd,
			String adongNm,
			String regionLabel,
			long totalStores,
			long categoryStoreCount,
			double competitionIndex,
			double categoryDiversityScore,
			double densityScore,
			double localBizScore
	) {
	}
}
