import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { BaseEntity } from '../common/entities/base.entity';
import { ColumnNumericTransformer } from '../common/transformers/numeric.transformer';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({
    type: 'int',
    default: 0,
    name: 'token_version',
  })
  tokenVersion: number;

  @Column({
    type: 'json',
    nullable: true,
  })
  roles: Role[];

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatar: string;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 8,
    default: '0',
    transformer: new ColumnNumericTransformer(),
  })
  credit: number;
}
