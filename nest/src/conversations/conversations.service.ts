import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { UsersCoreService } from '../users/users.core.service';
import {
  ConversationResDto,
  ConversationVersionResDto,
} from './dto/conversation.res.dto';
import { Message } from './message.entity';
import { ConversationsCoreService } from './conversations.core.service';
import { LabelsCoreService } from '../labels/labels.core.service';
import { Label } from '../labels/label.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    private conversationsCoreService: ConversationsCoreService,
    private usersCoreService: UsersCoreService,
    private labelsCoreService: LabelsCoreService,
  ) {}

  public toConversationDto(conversation: Conversation) {
    const conversationDto: ConversationResDto = {
      id: conversation.id,
      name: conversation.name,
      messages: conversation.messages,
      isPublic: conversation.isPublic,
      users: conversation.users.map((user) =>
        this.usersCoreService.toUserDto(user),
      ),
      label: conversation.label
        ? this.labelsCoreService.toLabelDto(conversation.label)
        : null,
      updatedAt: conversation.updatedAt,
      version: conversation.version,
    };
    return conversationDto;
  }

  async findOne(userId: number, id: number) {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
      relations: ['users', 'label'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const userInConversation = conversation.users.find(
      (user) => user.id === userId,
    );
    if (!userInConversation) {
      throw new ForbiddenException();
    }

    return conversation;
  }

  async findPublicOne(id: number) {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
      relations: ['users', 'label'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.isPublic) {
      throw new ForbiddenException();
    }

    return conversation;
  }

  async findVersions(userId: number): Promise<ConversationVersionResDto[]> {
    const conversations = await this.conversationsCoreService.find(userId);

    return conversations.map((conversation) => ({
      id: conversation.id,
      version: conversation.version,
    }));
  }

  async create(
    userId: number,
    name: string,
    messages: Message[],
  ): Promise<Conversation> {
    const user = await this.usersCoreService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const conversation = new Conversation();
    conversation.name = name;
    conversation.messages = messages;
    conversation.users = [user];
    return await this.conversationsRepository.save(conversation);
  }

  async cloneForSpecificUser(
    userId: number,
    id: number,
    targetUsername: string,
  ): Promise<Conversation> {
    const conversation = await this.findOne(userId, id);

    const targetUser =
      await this.usersCoreService.findOneByUsername(targetUsername);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const newConversation = new Conversation();
    newConversation.name = conversation.name;
    newConversation.messages = conversation.messages;
    newConversation.users = [targetUser];

    return await this.conversationsRepository.save(newConversation);
  }

  async addUserForUsers(
    userId: number,
    conversationId: number,
    username: string,
    ifMatch?: string,
  ) {
    const conversation = await this.findOne(userId, conversationId);

    this.assertIfMatch(conversation, ifMatch);

    const userToAdd = await this.usersCoreService.findOneByUsername(username);
    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    conversation.users.push(userToAdd);
    return await this.conversationsRepository.save(conversation);
  }

  async update(
    userId: number,
    id: number,
    name: string,
    messages: Message[],
    ifMatch?: string,
  ) {
    const conversation = await this.findOne(userId, id);

    this.assertIfMatch(conversation, ifMatch);

    conversation.name = name;
    conversation.messages = messages;

    return await this.conversationsRepository.save(conversation);
  }

  async updateName(userId: number, id: number, name: string, ifMatch?: string) {
    const conversation = await this.findOne(userId, id);

    this.assertIfMatch(conversation, ifMatch);

    conversation.name = name;

    return await this.conversationsRepository.save(conversation);
  }

  async updatePublic(
    userId: number,
    id: number,
    isPublic: boolean,
    ifMatch?: string,
  ) {
    const conversation = await this.findOne(userId, id);

    this.assertIfMatch(conversation, ifMatch);

    conversation.isPublic = isPublic;
    return await this.conversationsRepository.save(conversation);
  }

  async updateLabelLink(
    userId: number,
    id: number,
    labelId: number | null,
    ifMatch?: string,
  ) {
    const conversation = await this.findOne(userId, id);

    this.assertIfMatch(conversation, ifMatch);

    let label: Label | null = null;
    if (labelId !== null) {
      label = await this.labelsCoreService.findOne(userId, labelId);
    }
    conversation.label = label;

    return await this.conversationsRepository.save(conversation);
  }

  async delete(userId: number, id: number): Promise<Conversation> {
    const conversation = await this.findOne(userId, id);

    const result = await this.conversationsRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Conversation not deleted');
    }

    return conversation;
  }

  private assertIfMatch(conversation: Conversation, ifMatch?: string) {
    if (!ifMatch) {
      return;
    }
    const current = `${conversation.version}`;
    if (ifMatch !== current) {
      throw new PreconditionFailedException('ETag mismatch');
    }
  }
}
