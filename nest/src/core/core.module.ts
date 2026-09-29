import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Conversation } from '../conversations/conversation.entity';
import { Label } from '../labels/label.entity';
import { UsersCoreService } from '../users/users.core.service';
import { ConversationsCoreService } from '../conversations/conversations.core.service';
import { LabelsCoreService } from '../labels/labels.core.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Conversation, Label])],
  providers: [UsersCoreService, ConversationsCoreService, LabelsCoreService],
  exports: [UsersCoreService, ConversationsCoreService, LabelsCoreService],
})
export class CoreModule {}
