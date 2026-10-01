import {getNestOpenAPIConfiguration} from "@/lib/common/APIConfig";
import {AuthApi} from "@/client/nest";

export default class AuthClient {
  async createTokenByEmail(email: string, password: string): Promise<string> {
    const api = new AuthApi(getNestOpenAPIConfiguration());
    const res = await api.authControllerCreateTokenByEmail({
      email: email,
      password: password
    });
    return res.data.accessToken;
  }

  async createTokenByUsername(username: string, password: string): Promise<string> {
    const api = new AuthApi(getNestOpenAPIConfiguration());
    const res = await api.authControllerCreateTokenByUsername({
      username: username,
      password: password
    });
    return res.data.accessToken;
  }

  async createTokenByGoogle(idToken: string): Promise<string> {
    const api = new AuthApi(getNestOpenAPIConfiguration());
    const res = await api.authControllerCreateTokenByGoogle({
      idToken: idToken
    });
    return res.data.accessToken;
  }

  async fetchGoogleClientId(): Promise<string> {
    const api = new AuthApi(getNestOpenAPIConfiguration());
    const res = await api.authControllerGetGoogleClientId();
    return res.data.clientId;
  }
};
