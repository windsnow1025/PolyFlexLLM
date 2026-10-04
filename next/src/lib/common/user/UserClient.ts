import {getNestOpenAPIConfiguration} from "@/lib/common/APIConfig";
import {EmailVerificationReqDtoPurposeEnum, UserResDto, UserResDtoRolesEnum, UsersApi} from "@/client/nest";

export default class UserClient {
  async fetchUsers(): Promise<UserResDto[]> {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    const res = await api.usersControllerFindAll();
    return res.data;
  }

  async fetchUser(): Promise<UserResDto> {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    const res = await api.usersControllerFind();
    return res.data;
  }

  async createUser(username: string, email: string, password: string, token: string) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerCreate({ username, email, password, token });
  }

  async sendEmailVerification(email: string, purpose: EmailVerificationReqDtoPurposeEnum) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerSendEmailVerification({ email, purpose });
  }

  async sendPasswordResetEmail(email: string) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerSendPasswordResetEmail({ email });
  }

  async updateResetPassword(email: string, password: string, token: string) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerUpdateResetPassword({ email, password, token });
  }

  async updateEmail(email: string, token: string) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerUpdateEmail({ email, token });
  }

  async updateUsername(username: string) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerUpdateUsername({ username });
  }

  async updatePassword(password: string) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerUpdatePassword({ password });
  }

  async updateAvatar(avatar: string) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    const res = await api.usersControllerUpdateAvatar({ avatar });
    return res.data;
  }

  async updateUserPrivileges(
    username: string,
    roles: UserResDtoRolesEnum[],
    credit: number
  ) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerUpdatePrivileges({
      username,
      roles,
      credit,
    });
  }

  async deleteUser() {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerDelete();
  }

  async deleteUserById(id: number) {
    const api = new UsersApi(getNestOpenAPIConfiguration());
    await api.usersControllerDeleteById(id);
  }
}
