import rawTraits from "./traits.json";
import type { TraitDefinition, TraitId } from "../../types";

export const traits = rawTraits as TraitDefinition[];
export const traitById = new Map<TraitId, TraitDefinition>(traits.map((trait) => [trait.id, trait]));
