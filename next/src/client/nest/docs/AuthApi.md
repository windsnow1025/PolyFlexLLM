# AuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authControllerCreateTokenByEmail**](#authcontrollercreatetokenbyemail) | **POST** /auth/token/email | |
|[**authControllerCreateTokenByGoogle**](#authcontrollercreatetokenbygoogle) | **POST** /auth/token/google | |
|[**authControllerCreateTokenByUsername**](#authcontrollercreatetokenbyusername) | **POST** /auth/token/username | |
|[**authControllerGetGoogleClientId**](#authcontrollergetgoogleclientid) | **GET** /auth/google/client-id | |

# **authControllerCreateTokenByEmail**
> AuthTokenResDto authControllerCreateTokenByEmail(authTokenEmailReqDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    AuthTokenEmailReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let authTokenEmailReqDto: AuthTokenEmailReqDto; //

const { status, data } = await apiInstance.authControllerCreateTokenByEmail(
    authTokenEmailReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **authTokenEmailReqDto** | **AuthTokenEmailReqDto**|  | |


### Return type

**AuthTokenResDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerCreateTokenByGoogle**
> AuthTokenResDto authControllerCreateTokenByGoogle(authTokenGoogleReqDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    AuthTokenGoogleReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let authTokenGoogleReqDto: AuthTokenGoogleReqDto; //

const { status, data } = await apiInstance.authControllerCreateTokenByGoogle(
    authTokenGoogleReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **authTokenGoogleReqDto** | **AuthTokenGoogleReqDto**|  | |


### Return type

**AuthTokenResDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerCreateTokenByUsername**
> AuthTokenResDto authControllerCreateTokenByUsername(authTokenUsernameReqDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    AuthTokenUsernameReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let authTokenUsernameReqDto: AuthTokenUsernameReqDto; //

const { status, data } = await apiInstance.authControllerCreateTokenByUsername(
    authTokenUsernameReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **authTokenUsernameReqDto** | **AuthTokenUsernameReqDto**|  | |


### Return type

**AuthTokenResDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerGetGoogleClientId**
> AuthGoogleClientIdResDto authControllerGetGoogleClientId()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authControllerGetGoogleClientId();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**AuthGoogleClientIdResDto**

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

