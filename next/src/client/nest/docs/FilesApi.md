# FilesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**filesControllerCloneFiles**](#filescontrollerclonefiles) | **POST** /files/clone | |
|[**filesControllerDeleteFiles**](#filescontrollerdeletefiles) | **DELETE** /files | |
|[**filesControllerGetFiles**](#filescontrollergetfiles) | **GET** /files | |
|[**filesControllerGetWebUrl**](#filescontrollergetweburl) | **GET** /files/web-url | |
|[**filesControllerUploadFiles**](#filescontrolleruploadfiles) | **POST** /files | |

# **filesControllerCloneFiles**
> FilesResDto filesControllerCloneFiles(filesReqDto)


### Example

```typescript
import {
    FilesApi,
    Configuration,
    FilesReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new FilesApi(configuration);

let filesReqDto: FilesReqDto; //

const { status, data } = await apiInstance.filesControllerCloneFiles(
    filesReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **filesReqDto** | **FilesReqDto**|  | |


### Return type

**FilesResDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerDeleteFiles**
> filesControllerDeleteFiles(filesReqDto)


### Example

```typescript
import {
    FilesApi,
    Configuration,
    FilesReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new FilesApi(configuration);

let filesReqDto: FilesReqDto; //

const { status, data } = await apiInstance.filesControllerDeleteFiles(
    filesReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **filesReqDto** | **FilesReqDto**|  | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerGetFiles**
> FilesResDto filesControllerGetFiles()


### Example

```typescript
import {
    FilesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FilesApi(configuration);

const { status, data } = await apiInstance.filesControllerGetFiles();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**FilesResDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerGetWebUrl**
> WebUrlResDto filesControllerGetWebUrl()


### Example

```typescript
import {
    FilesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FilesApi(configuration);

const { status, data } = await apiInstance.filesControllerGetWebUrl();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**WebUrlResDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerUploadFiles**
> filesControllerUploadFiles()


### Example

```typescript
import {
    FilesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FilesApi(configuration);

const { status, data } = await apiInstance.filesControllerUploadFiles();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

