import WhatsApp from "@workspace/wa-cloud-api";
import { Registry } from "./utils/class-registry";

export const waClientRegistry = new Registry<WhatsApp>();
