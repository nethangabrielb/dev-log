import { Injectable } from '@nestjs/common';
import { CreateDsaDto } from './dto/create-dsa.dto';
import { UpdateDsaDto } from './dto/update-dsa.dto';

@Injectable()
export class DsaService {
  create(createDsaDto: CreateDsaDto) {
    return 'This action adds a new dsa';
  }

  findAll() {
    return `This action returns all dsa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dsa`;
  }

  update(id: number, updateDsaDto: UpdateDsaDto) {
    return `This action updates a #${id} dsa`;
  }

  remove(id: number) {
    return `This action removes a #${id} dsa`;
  }
}
