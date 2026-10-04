import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { AppConfig } from '../config/config.interface';

@Injectable()
export class FirebaseService {
  private readonly auth: Auth;
  private readonly firebaseUserPassword = 'FirebaseUserPassword';

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<AppConfig>('app')!;
    const app = initializeApp(config.firebase.config);
    this.auth = getAuth(app);
  }

  async createFirebaseUser(email: string) {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      this.firebaseUserPassword,
    );
    return userCredential.user;
  }

  async sendFirebaseEmailVerification(email: string, continueUrl: string) {
    const user = await this.signInFirebaseUser(email);
    await sendEmailVerification(user, { url: continueUrl });
  }

  private async signInFirebaseUser(email: string) {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      email,
      this.firebaseUserPassword,
    );
    return userCredential.user;
  }
}
