"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface Division {
  id: number;
  name: string;
  bn_name: string;
}

export interface District {
  id: number;
  division_id: number;
  name: string;
  bn_name: string;
}

export interface Upazila {
  id: number;
  district_id: number;
  name: string;
  bn_name: string;
}

export interface Area {
  id: number;
  upazila_id: number;
  name: string;
  bn_name: string;
}

export async function getDivisions(): Promise<ApiResponse<Division[]>> {
  return requestApi<Division[]>("/admin/locations/divisions", { fallbackData: [] });
}

export async function getDistricts(divisionId: number): Promise<ApiResponse<District[]>> {
  return requestApi<District[]>(`/admin/locations/districts/${divisionId}`, { fallbackData: [] });
}

export async function getUpazilas(districtId: number): Promise<ApiResponse<Upazila[]>> {
  return requestApi<Upazila[]>(`/admin/locations/upazilas/${districtId}`, { fallbackData: [] });
}

export async function getAreas(upazilaId: number): Promise<ApiResponse<Area[]>> {
  return requestApi<Area[]>(`/admin/locations/areas/${upazilaId}`, { fallbackData: [] });
}

export async function getPublicDistricts(): Promise<ApiResponse<District[]>> {
  return requestApi<District[]>("/customer/districts", { isPublic: true, fallbackData: [] });
}


