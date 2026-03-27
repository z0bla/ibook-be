import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'john@example.com',
      name: 'John Doe',
      phone: '+1-555-0123',
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
  };
}
