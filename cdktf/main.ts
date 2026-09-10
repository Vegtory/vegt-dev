import {
  App,
  TerraformStack,
  S3Backend,
} from "cdktf";
import { CloudflareProvider } from "@cdktf/provider-cloudflare/lib/provider";
import { R2Bucket } from "@cdktf/provider-cloudflare/lib/r2-bucket";
import * as dotenv from "dotenv";

dotenv.config();

interface CfStackConfig {
  cfApiToken: string;
  zoneIds: string[];
  siteDomains: string[];
  accountId: string;
  projectName: string;
  isDev: boolean;
  productionBranch: string;
  buildDestinationDir: string;
  // For R2 State Backend
  r2StateBucketName?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
}

class CfStack extends TerraformStack {
  constructor(app: App, id: string) {
    super(app, id);

    // Helper for parsing JSON environment variables
    const parseJsonEnv = <T>(key: string, defaultValue: T): T => {
      const value = process.env[key];
      if (!value) {
        console.warn(
          `Environment variable ${key} is not set. Using default value.`
        );
        return defaultValue;
      }
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        console.error(
          `Failed to parse JSON for environment variable ${key}:`,
          e
        );
        return defaultValue;
      }
    };

    // Load and validate configuration
    const config: CfStackConfig = {
      cfApiToken:
        process.env.CF_API_TOKEN || this.throwError("CF_API_TOKEN is required"),
      zoneIds: parseJsonEnv<string[]>("ZONE_IDS", []),
      siteDomains: parseJsonEnv<string[]>("SITE_DOMAINS", []),
      accountId:
        process.env.ACCOUNT_ID || this.throwError("ACCOUNT_ID is required"),
      projectName:
        process.env.PROJECT_NAME || this.throwError("PROJECT_NAME is required"),
      isDev: process.env.IS_DEV === "true",
      productionBranch: process.env.PRODUCTION_BRANCH || "main",
      buildDestinationDir: process.env.BUILD_DESTINATION_DIR || "dist",
      // Config for R2 state backend (optional)
      r2StateBucketName: process.env.R2_STATE_BUCKET_NAME,
      r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
      r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    };

    this.defineResources(config);

    // ─── Backend (State Storage) ──────────────────────────────────────────────
    if (
      config.r2StateBucketName &&
      config.r2AccessKeyId &&
      config.r2SecretAccessKey
    ) {
      console.log(
        `Configuring remote state backend in R2 bucket: ${config.r2StateBucketName}`
      );
      const stateFile = "terraform-cloudflare.tfstate";

      new S3Backend(this, {
        bucket: config.r2StateBucketName,
        key: stateFile,
        region: "auto",
        endpoints: {
          s3: `https://${config.accountId}.r2.cloudflarestorage.com`,
        },

        accessKey: config.r2AccessKeyId,
        secretKey: config.r2SecretAccessKey,

        // R2 quirks
        skipCredentialsValidation: true,
        skipMetadataApiCheck: true,
        skipRegionValidation: true,
        skipRequestingAccountId: true,
        skipS3Checksum: true,
        usePathStyle: true,
      });
    } else {
      console.log(
        "R2 state backend variables not set. Using default local state."
      );
    }
  }

  private defineResources(config: CfStackConfig) {
    // ─── Provider ─────────────────────────────────────────────────────────────
    new CloudflareProvider(this, "cloudflare", {
      apiToken: config.cfApiToken,
    });

    // ─── R2 Bucket for application state/storage (optional) ───────────────────
    if (!config.r2StateBucketName || !config.r2AccessKeyId || !config.r2SecretAccessKey) {
      new R2Bucket(this, "r2-bucket", {
        accountId: config.accountId,
        name: `${config.projectName}-storage`,
        location: "WEUR",
        jurisdiction: "default"
      });
      console.log("R2 state backend variables are not set. R2 bucket will only be created.");
      console.log("For all resources first configure R2 keys");
      return;
    }

    const r2Bucket = new R2Bucket(this, "r2-bucket", {
      accountId: config.accountId,
      name: `${config.projectName}-storage`,
      location: "WEUR",
      jurisdiction: "default"
    });
    const storageId = `${config.accountId}/${config.r2StateBucketName}/default`;
    r2Bucket.importFrom(storageId);
  }

  // Helper to throw an error for missing environment variables
  private throwError(message: string): never {
    throw new Error(message);
  }
}

const app = new App();
new CfStack(app, "cloudflare");
app.synth();
