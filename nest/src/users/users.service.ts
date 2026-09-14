import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { Role } from '../common/enums/role.enum';
import { FirebaseService } from './firebase.service';
import { FirebaseAdminService } from './firebase-admin.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { UsersCoreService } from './users.core.service';
import { ConversationsCoreService } from '../conversations/conversations.core.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersCoreService: UsersCoreService,
    private conversationsCoreService: ConversationsCoreService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly firebaseService: FirebaseService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  findAll() {
    return this.usersRepository.find({
      order: { id: 'ASC' },
    });
  }

  async create(username: string, email: string, password: string) {
    if (
      (await this.usersCoreService.findOneByUsername(username)) ||
      (await this.usersCoreService.findOneByEmail(email))
    ) {
      throw new ConflictException();
    }

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = await this.hashPassword(password);
    user.roles = [Role.User];

    return await this.usersRepository.save(user);
  }

  async sendEmailVerification(email: string) {
    try {
      await this.firebaseAdminService.deleteUserByEmail(email);
    } catch {
      /* empty */
    }
    await this.firebaseService.createFirebaseUser(email);
    await this.firebaseService.sendFirebaseEmailVerification(email);
  }

  async sendPasswordResetEmail(email: string) {
    try {
      await this.firebaseAdminService.deleteUserByEmail(email);
    } catch {
      /* empty */
    }
    await this.firebaseService.createFirebaseUser(email);
    await this.firebaseService.sendFirebasePasswordResetEmail(email);
  }

  async updateResetPassword(email: string, password: string) {
    const user = await this.usersCoreService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await this.firebaseService.verifyFirebaseUser(email, password))) {
      throw new UnauthorizedException('Invalid password');
    }

    return await this.updatePassword(user, password);
  }

  async updateEmail(id: number, email: string) {
    const user = await this.usersCoreService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email === email) {
      return user;
    }

    if (await this.usersCoreService.findOneByEmail(email)) {
      throw new ConflictException();
    }

    user.email = email;
    user.emailVerified = false;

    await this.cacheManager.del(this.usersCoreService.getUserCacheKey(id));
    return await this.usersRepository.save(user);
  }

  async updateUsername(id: number, username: string) {
    const user = await this.usersCoreService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.username === username) {
      return user;
    }

    if (await this.usersCoreService.findOneByUsername(username)) {
      throw new ConflictException();
    }

    user.username = username;

    await this.cacheManager.del(this.usersCoreService.getUserCacheKey(id));
    return await this.usersRepository.save(user);
  }

  async updatePassword(user: User, password: string) {
    user.password = await this.hashPassword(password);
    user.tokenVersion = user.tokenVersion + 1;

    await this.cacheManager.del(this.usersCoreService.getUserCacheKey(user.id));
    return await this.usersRepository.save(user);
  }

  async updateAvatar(id: number, avatarUrl: string) {
    const user = await this.usersCoreService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatar = avatarUrl;

    await this.cacheManager.del(this.usersCoreService.getUserCacheKey(id));
    return await this.usersRepository.save(user);
  }

  async updatePrivileges(
    username: string,
    emailVerified: boolean,
    roles: Role[],
    credit: number,
  ) {
    const user = await this.usersCoreService.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.emailVerified = emailVerified;
    user.roles = roles;
    user.credit = credit;

    await this.cacheManager.del(this.usersCoreService.getUserCacheKey(user.id));
    return await this.usersRepository.save(user);
  }

  async delete(id: number) {
    await this.conversationsCoreService.deleteOrphansByUserId(id);

    await this.cacheManager.del(this.usersCoreService.getUserCacheKey(id));
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not deleted');
    }
    return result;
  }

  async deleteAllFirebaseUsers() {
    await this.firebaseAdminService.deleteAllUsers();
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }
}
