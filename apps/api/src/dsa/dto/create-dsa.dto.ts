import {
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export enum DsaPattern {
  TWO_POINTERS = 'Two Pointers',
  SLIDING_WINDOW = 'Sliding Window',
  BINARY_SEARCH = 'Binary Search',
  STACK = 'Stack',
  LINKED_LIST = 'Linked List',
  TREES = 'Trees',
  GRAPHS = 'Graphs',
  DYNAMIC_PROGRAMMING = 'Dynamic Programming',
  GREEDY = 'Greedy',
  BACKTRACKING = 'Backtracking',
  HASHING = 'Hashing',
  HEAP = 'Heap',
  TWO_POINTERS_FAST_SLOW = 'Fast & Slow Pointers',
}

export enum ConfidenceLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export class CreateDsaDto {
  @IsString()
  problemName!: string;

  @IsInt()
  problemNumber!: number;

  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @IsEnum(DsaPattern)
  pattern!: DsaPattern;

  @IsOptional()
  @IsBoolean()
  isSolved!: boolean;

  @IsEnum(ConfidenceLevel)
  confidenceLevel!: ConfidenceLevel;

  @IsOptional()
  @IsString()
  optionalNotes?: string;
}
