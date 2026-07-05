import { Injectable } from '@nestjs/common';
import { CreateDsaDto } from './dto/create-dsa.dto';
import { UpdateDsaDto } from './dto/update-dsa.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Dsa } from './entities/dsa.entity';
import { Model } from 'mongoose';

@Injectable()
export class DsaService {
  constructor(@InjectModel(Dsa.name) private dsaModel: Model<Dsa>) {}

  async create(createDsaDto: CreateDsaDto) {
    return this.dsaModel.create(createDsaDto);
  }

  async findAll() {
    return this.dsaModel.find().exec();
  }

  async findOne(id: string) {
    return this.dsaModel.findById(id).exec();
  }

  async update(id: string, updateDsaDto: UpdateDsaDto) {
    return this.dsaModel
      .findByIdAndUpdate(id, updateDsaDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.dsaModel.findByIdAndDelete(id).exec();
  }
}
