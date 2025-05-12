import { TestBed } from '@angular/core/testing';

import { CommandConfigService } from './command-config.service';

describe('CommandConfigService', () => {
  let service: CommandConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommandConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
