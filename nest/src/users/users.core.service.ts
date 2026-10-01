import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { UserResDto } from './dto/user.res.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersCoreService {
  private readonly userCacheTtl = 60 * 60 * 1000;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  public toUserDto(user: User) {
    const userDto: UserResDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      avatar: user.avatar,
      credit: user.credit,
    };
    return userDto;
  }

  public getUserCacheKey(id: number): string {
    return `user:${id}`;
  }

  public async verifyPassword(user: User, password: string) {
    if (!user.password) {
      return false;
    }
    return await bcrypt.compare(password, user.password);
  }

  async findOneById(id: number) {
    if (!id) {
      throw new UnauthorizedException();
    }

    const cacheKey = this.getUserCacheKey(id);
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      await this.cacheManager.set(cacheKey, user, this.userCacheTtl);
    }
    return user;
  }

  findOneByUsername(username: string) {
    if (!username) {
      throw new UnauthorizedException();
    }
    return this.usersRepository.findOneBy({ username });
  }

  findOneByEmail(email: string) {
    if (!email) {
      throw new UnauthorizedException();
    }
    return this.usersRepository.findOneBy({ email });
  }

  async findOrCreateByGoogle(
    googleId: string,
    email: string,
    avatar: string | undefined,
  ) {
    // Google account already linked
    const googleUser = await this.usersRepository.findOneBy({ googleId });
    if (googleUser) {
      return googleUser;
    }

    // Email already registered: link the Google account
    const emailUser = await this.findOneByEmail(email);
    if (emailUser) {
      emailUser.googleId = googleId;

      await this.cacheManager.del(this.getUserCacheKey(emailUser.id));
      return await this.usersRepository.save(emailUser);
    }

    // New user: create the account
    const user = new User();
    user.username = await this.generateUsername(email);
    user.email = email;
    user.googleId = googleId;
    if (avatar) {
      user.avatar = avatar;
    }
    user.roles = [Role.User];

    return await this.usersRepository.save(user);
  }

  async adjustCredit(id: number, amount: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.credit += amount;

    await this.cacheManager.del(this.getUserCacheKey(id));
    return await this.usersRepository.save(user);
  }

  private async generateUsername(email: string): Promise<string> {
    const base = email.split('@')[0];
    let username = base;
    let suffix = 1;
    while (await this.findOneByUsername(username)) {
      username = `${base}_${suffix}`;
      suffix += 1;
    }
    return username;
  }
}
