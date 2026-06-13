// types/catalog.ts
import type { Database } from '@/types/database.types'

export type CatalogBrand = Database['public']['Tables']['catalog_brands']['Row']
export type CatalogModel = Database['public']['Tables']['catalog_models']['Row']
export type Part = Database['public']['Tables']['parts_catalog']['Row']
export type PartCompatibility = Database['public']['Tables']['part_compatibilities']['Row']

export interface CatalogModelWithBrand extends CatalogModel {
  brand_name?: string
}

export interface PartWithCompatibilities extends Part {
  compatible_models: CatalogModelWithBrand[]
}

export interface CatalogBrandWithModels extends CatalogBrand {
  models: CatalogModel[]
}
