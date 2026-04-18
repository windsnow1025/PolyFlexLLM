import {Temporal} from "@js-temporal/polyfill";
import UserClient from "./UserClient";
import AuthClient from "@/lib/common/user/AuthClient";
import {handleError} from "@/lib/common/ErrorHandler";
import {UserResDto, UserResDtoRolesEnum} from "@/client/nest";
import {StorageKeys} from "@/lib/common/Constants";

export default class UserLogic {
  private authService: AuthClient;
  private userClient: UserClient;

  constructor() {
    this.authService = new AuthClient();
    this.userClient = new UserClient();
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      const exp = payload.exp;
      const now = Math.floor(Temporal.Now.instant().epochMilliseconds / 1000);

      return exp < now;
    } catch (error) {
      console.error("Invalid token format:", error);
      return true;
    }
  }

  async fetchUsers(): Promise<UserResDto[]> {
    try {
      return await this.userClient.fetchUsers();
    } catch (error) {
      handleError(error, 'Failed to fetch users');
    }
  }

  async fetchUsernames(): Promise<string[]> {
    try {
      const users = await this.userClient.fetchUsers();
      return users.map(user => user.username);
    } catch (error) {
      handleError(error, 'Failed to fetch usernames');
    }
  }

  async fetchUser() {
    const token = localStorage.getItem(StorageKeys.Token)
    if (this.isTokenExpired(token)) {
      localStorage.removeItem(StorageKeys.Token);
      return null;
    }
    try {
      return await this.userClient.fetchUser();
    } catch (error) {
      handleError(error, 'Failed to fetch user');
    }
  }

  async fetchEmailVerified() {
    const user = await this.fetchUser();
    if (!user) {
      return null;
    }
    return user.emailVerified;
  }

  async fetchCredit() {
    const user = await this.fetchUser();
    if (!user) {
      return null;
    }
    return user.credit;
  }

  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.userClient.fetchUser();
      return user.roles.includes(UserResDtoRolesEnum.Admin);
    } catch (error) {
      handleError(error, 'Failed to check admin status');
    }
  }

  async signInByEmail(email: string, password: string) {
    try {
      const token = await this.authService.createTokenByEmail(email, password);
      localStorage.setItem(StorageKeys.Token, token);
    } catch (error) {
      handleError(error, 'Sign in failed');
    }
  }

  async signInByUsername(username: string, password: string) {
    try {
      const token = await this.authService.createTokenByUsername(username, password);
      localStorage.setItem(StorageKeys.Token, token);
    } catch (error) {
      handleError(error, 'Sign in failed');
    }
  }

  async signUp(username: string, email: string, password: string) {
    try {
      await this.userClient.createUser(username, email, password);
    } catch (error) {
      handleError(error, 'Sign up failed');
    }
  }

  async sendEmailVerification(email: string) {
    try {
      await this.userClient.sendEmailVerification(email);
    } catch (error) {
      handleError(error, 'Send email verification failed');
    }
  }

  async sendPasswordResetEmail(email: string) {
    try {
      await this.userClient.sendPasswordResetEmail(email);
    } catch (error) {
      handleError(error, 'Failed to send password reset email');
    }
  }

  async updateEmailVerified(): Promise<boolean> {
    try {
      const user = await this.userClient.updateEmailVerified();
      return user.emailVerified;
    } catch (error) {
      handleError(error, 'Update email verification failed');
    }
  }

  async updateResetPassword(email: string, password: string) {
    try {
      await this.userClient.updateResetPassword(email, password);
    } catch (error) {
      handleError(error, 'Failed to update reset password');
    }
  }

  async updateEmail(email: string) {
    try {
      await this.userClient.updateEmail(email);
    } catch (error) {
      handleError(error, 'Update email failed');
    }
  }

  async updateUsername(username: string) {
    try {
      await this.userClient.updateUsername(username);
    } catch (error) {
      handleError(error, 'Update username failed');
    }
  }

  async updatePassword(password: string) {
    try {
      await this.userClient.updatePassword(password);
    } catch (error) {
      handleError(error, 'Update password failed');
    }
  }

  async updateAvatar(avatar: string) {
    try {
      return await this.userClient.updateAvatar(avatar);
    } catch (error) {
      handleError(error, 'Failed to update avatar');
    }
  }

  async updateUserPrivileges(username: string, emailVerified: boolean, roles: UserResDtoRolesEnum[], credit: number) {
    try {
      return await this.userClient.updateUserPrivileges(username, emailVerified, roles, credit);
    } catch (error) {
      handleError(error, 'Failed to update privileges');
    }
  }

  async deleteUser() {
    try {
      await this.userClient.deleteUser();
    } catch (error) {
      handleError(error, 'Failed to delete user');
    }
  }

  async deleteUserById(id: number) {
    try {
      return await this.userClient.deleteUserById(id);
    } catch (error) {
      handleError(error, 'Failed to delete user');
    }
  }

  validateUsernameOrPassword(input: string) {
    const asciiRegex = /^[\x21-\x7E]{4,32}$/;
    return asciiRegex.test(input);
  }

  validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}