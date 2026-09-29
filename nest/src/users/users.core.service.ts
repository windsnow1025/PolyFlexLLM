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
    const hash = user.password;
    return await bcrypt.compare(password, hash);
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

  async adjustCredit(id: number, amount: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.credit += amount;

    await this.cacheManager.del(this.getUserCacheKey(id));
    return await this.usersRepository.save(user);
  }
}
