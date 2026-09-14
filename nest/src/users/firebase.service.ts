import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
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

  async sendFirebaseEmailVerification(email: string) {
    const user = await this.signInFirebaseUser(
      email,
      this.firebaseUserPassword,
    );
    await sendEmailVerification(user);
  }

  async checkEmailVerified(email: string): Promise<boolean> {
    try {
      const user = await this.signInFirebaseUser(
        email,
        this.firebaseUserPassword,
      );
      if (!user.emailVerified) {
        return false;
      }
      await deleteUser(user);
    } catch {
      return false;
    }
    return true;
  }

  async verifyFirebaseUser(email: string, password: string) {
    try {
      const user = await this.signInFirebaseUser(email, password);
      await deleteUser(user);
    } catch {
      return false;
    }
    return true;
  }

  async sendFirebasePasswordResetEmail(email: string) {
    await sendPasswordResetEmail(this.auth, email);
  }

  private async signInFirebaseUser(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password,
    );
    return userCredential.user;
  }
}
