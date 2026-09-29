# UsersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**usersControllerCreate**](#userscontrollercreate) | **POST** /users/user | |
|[**usersControllerDelete**](#userscontrollerdelete) | **DELETE** /users/user | |
|[**usersControllerDeleteAllFirebaseUsers**](#userscontrollerdeleteallfirebaseusers) | **DELETE** /users/user/firebase | |
|[**usersControllerDeleteById**](#userscontrollerdeletebyid) | **DELETE** /users/user/{id} | |
|[**usersControllerFind**](#userscontrollerfind) | **GET** /users/user | |
|[**usersControllerFindAll**](#userscontrollerfindall) | **GET** /users | |
|[**usersControllerReduceCredit**](#userscontrollerreducecredit) | **PATCH** /users/user/reduce-credit | |
|[**usersControllerSendEmailVerification**](#userscontrollersendemailverification) | **POST** /users/user/email-verification | |
|[**usersControllerSendPasswordResetEmail**](#userscontrollersendpasswordresetemail) | **POST** /users/user/password-reset-email | |
|[**usersControllerUpdateAvatar**](#userscontrollerupdateavatar) | **PUT** /users/user/avatar | |
|[**usersControllerUpdateEmail**](#userscontrollerupdateemail) | **PUT** /users/user/email | |
|[**usersControllerUpdatePassword**](#userscontrollerupdatepassword) | **PUT** /users/user/password | |
|[**usersControllerUpdatePrivileges**](#userscontrollerupdateprivileges) | **PUT** /users/user/privileges | |
|[**usersControllerUpdateResetPassword**](#userscontrollerupdateresetpassword) | **PUT** /users/user/reset-password | |
|[**usersControllerUpdateUsername**](#userscontrollerupdateusername) | **PUT** /users/user/username | |

# **usersControllerCreate**
> UserResDto usersControllerCreate(userSignUpReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserSignUpReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userSignUpReqDto: UserSignUpReqDto; //

const { status, data } = await apiInstance.usersControllerCreate(
    userSignUpReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userSignUpReqDto** | **UserSignUpReqDto**|  | |


### Return type

**UserResDto**

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

# **usersControllerDelete**
> usersControllerDelete()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.usersControllerDelete();
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersControllerDeleteAllFirebaseUsers**
> usersControllerDeleteAllFirebaseUsers()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.usersControllerDeleteAllFirebaseUsers();
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersControllerDeleteById**
> usersControllerDeleteById()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.usersControllerDeleteById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersControllerFind**
> UserResDto usersControllerFind()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.usersControllerFind();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserResDto**

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

# **usersControllerFindAll**
> Array<UserResDto> usersControllerFindAll()


### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.usersControllerFindAll();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<UserResDto>**

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

# **usersControllerReduceCredit**
> UserResDto usersControllerReduceCredit(reduceCreditReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    ReduceCreditReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let reduceCreditReqDto: ReduceCreditReqDto; //

const { status, data } = await apiInstance.usersControllerReduceCredit(
    reduceCreditReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reduceCreditReqDto** | **ReduceCreditReqDto**|  | |


### Return type

**UserResDto**

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

# **usersControllerSendEmailVerification**
> usersControllerSendEmailVerification(emailVerificationReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    EmailVerificationReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let emailVerificationReqDto: EmailVerificationReqDto; //

const { status, data } = await apiInstance.usersControllerSendEmailVerification(
    emailVerificationReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **emailVerificationReqDto** | **EmailVerificationReqDto**|  | |


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersControllerSendPasswordResetEmail**
> usersControllerSendPasswordResetEmail(userEmailReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserEmailReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userEmailReqDto: UserEmailReqDto; //

const { status, data } = await apiInstance.usersControllerSendPasswordResetEmail(
    userEmailReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userEmailReqDto** | **UserEmailReqDto**|  | |


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersControllerUpdateAvatar**
> UserResDto usersControllerUpdateAvatar(userAvatarReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserAvatarReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userAvatarReqDto: UserAvatarReqDto; //

const { status, data } = await apiInstance.usersControllerUpdateAvatar(
    userAvatarReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userAvatarReqDto** | **UserAvatarReqDto**|  | |


### Return type

**UserResDto**

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

# **usersControllerUpdateEmail**
> UserResDto usersControllerUpdateEmail(verifiedEmailReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    VerifiedEmailReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let verifiedEmailReqDto: VerifiedEmailReqDto; //

const { status, data } = await apiInstance.usersControllerUpdateEmail(
    verifiedEmailReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **verifiedEmailReqDto** | **VerifiedEmailReqDto**|  | |


### Return type

**UserResDto**

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

# **usersControllerUpdatePassword**
> UserResDto usersControllerUpdatePassword(userPasswordReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserPasswordReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userPasswordReqDto: UserPasswordReqDto; //

const { status, data } = await apiInstance.usersControllerUpdatePassword(
    userPasswordReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userPasswordReqDto** | **UserPasswordReqDto**|  | |


### Return type

**UserResDto**

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

# **usersControllerUpdatePrivileges**
> UserResDto usersControllerUpdatePrivileges(userPrivilegesReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserPrivilegesReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userPrivilegesReqDto: UserPrivilegesReqDto; //

const { status, data } = await apiInstance.usersControllerUpdatePrivileges(
    userPrivilegesReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userPrivilegesReqDto** | **UserPrivilegesReqDto**|  | |


### Return type

**UserResDto**

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

# **usersControllerUpdateResetPassword**
> UserResDto usersControllerUpdateResetPassword(userEmailPasswordReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserEmailPasswordReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userEmailPasswordReqDto: UserEmailPasswordReqDto; //

const { status, data } = await apiInstance.usersControllerUpdateResetPassword(
    userEmailPasswordReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userEmailPasswordReqDto** | **UserEmailPasswordReqDto**|  | |


### Return type

**UserResDto**

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

# **usersControllerUpdateUsername**
> UserResDto usersControllerUpdateUsername(userUsernameReqDto)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserUsernameReqDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userUsernameReqDto: UserUsernameReqDto; //

const { status, data } = await apiInstance.usersControllerUpdateUsername(
    userUsernameReqDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userUsernameReqDto** | **UserUsernameReqDto**|  | |


### Return type

**UserResDto**

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

