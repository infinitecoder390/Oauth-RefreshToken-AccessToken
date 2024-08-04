import { Test, TestingModule } from '@nestjs/testing';
import { AuthtokensService } from './authtokens.service';

describe('AuthtokensService', () => {
  let service: AuthtokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthtokensService],
    }).compile();

    service = module.get<AuthtokensService>(AuthtokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
