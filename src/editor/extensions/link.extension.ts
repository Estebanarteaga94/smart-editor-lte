export const secureLinkExtensionName = 'secureLink';

export interface SecureLinkOptions {
  allowedProtocols: readonly string[];
  openOnClick: boolean;
}
