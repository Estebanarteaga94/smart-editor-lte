export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface AutosaveService {
  status: AutosaveStatus;
  schedule(): void;
  flush(): Promise<void>;
  cancel(): void;
}
