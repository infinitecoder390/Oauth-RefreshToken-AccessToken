import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hashedPassword });
    return user.save();
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async list() {
    return this.userModel.find({}).exec();
  }
  // Add other CRUD methods as needed
}
