import { z } from 'zod';

import { PASSWORD_REQUIRED_ERROR, PHONE_INCOMPLETE_ERROR, PHONE_PATTERN } from '@shared/constants';

export const phoneSchema = z.string().regex(PHONE_PATTERN, PHONE_INCOMPLETE_ERROR);
export const passwordSchema = z.string().min(1, PASSWORD_REQUIRED_ERROR);
