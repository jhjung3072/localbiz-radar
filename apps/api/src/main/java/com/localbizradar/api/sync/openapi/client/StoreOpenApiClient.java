package com.localbizradar.api.sync.openapi.client;

import com.localbizradar.api.sync.openapi.dto.StoreOpenApiPage;
import com.localbizradar.api.sync.openapi.dto.StoreOpenApiRequest;

public interface StoreOpenApiClient {

	StoreOpenApiPage fetchStores(StoreOpenApiRequest request);
}
