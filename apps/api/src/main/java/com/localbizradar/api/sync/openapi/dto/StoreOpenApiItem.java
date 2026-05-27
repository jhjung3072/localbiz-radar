package com.localbizradar.api.sync.openapi.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StoreOpenApiItem(
		@JsonAlias({"상가업소번호", "상가업소관리번호"})
		String bizesId,
		@JsonAlias("상호명")
		String bizesNm,
		@JsonAlias({"지점명", "지점명칭"})
		String brchNm,
		@JsonAlias("상권업종대분류코드")
		String indsLclsCd,
		@JsonAlias("상권업종대분류명")
		String indsLclsNm,
		@JsonAlias("상권업종중분류코드")
		String indsMclsCd,
		@JsonAlias("상권업종중분류명")
		String indsMclsNm,
		@JsonAlias("상권업종소분류코드")
		String indsSclsCd,
		@JsonAlias("상권업종소분류명")
		String indsSclsNm,
		String ksicCd,
		String ksicNm,
		String ctprvnCd,
		@JsonAlias("시도명")
		String ctprvnNm,
		String signguCd,
		@JsonAlias("시군구명")
		String signguNm,
		String adongCd,
		@JsonAlias({"행정동명", "법정동명"})
		String adongNm,
		String ldongCd,
		String ldongNm,
		String lnoCd,
		String plotSctCd,
		String plotSctNm,
		String lnoMnno,
		String lnoSlno,
		@JsonAlias("지번주소")
		String lnoAdr,
		String rdnmCd,
		String rdnm,
		String bldMnno,
		String bldSlno,
		String bldMngNo,
		String bldNm,
		@JsonAlias("도로명주소")
		String rdnmAdr,
		String oldZipcd,
		String newZipcd,
		String dongNo,
		String flrNo,
		String hoNo,
		@JsonAlias({"경도", "longitude"})
		String lon,
		@JsonAlias({"위도", "latitude"})
		String lat,
		String chgGb,
		String chgDt
) {
}
