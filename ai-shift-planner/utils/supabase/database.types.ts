export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    password_hash: string
                    role: 'manager' | 'staff'
                    name: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    email: string
                    password_hash: string
                    role?: 'manager' | 'staff'
                    name?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    password_hash?: string
                    role?: 'manager' | 'staff'
                    name?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            shops: {
                Row: {
                    id: string
                    name: string
                    timezone: string
                    week_start: 'monday' | 'sunday'
                    owner_id: string
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    timezone: string
                    week_start?: 'monday' | 'sunday'
                    owner_id: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    timezone?: string
                    week_start?: 'monday' | 'sunday'
                    owner_id?: string
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            shop_operating_hours: {
                Row: {
                    id: string
                    shop_id: string
                    day_of_week: number // 0=Monday, 6=Sunday
                    open_time: string
                    close_time: string
                    is_closed: boolean
                }
                Insert: {
                    id?: string
                    shop_id: string
                    day_of_week: number
                    open_time: string
                    close_time: string
                    is_closed?: boolean
                }
                Update: {
                    id?: string
                    shop_id?: string
                    day_of_week?: number
                    open_time?: string
                    close_time?: string
                    is_closed?: boolean
                }
            }
            staff: {
                Row: {
                    id: string
                    shop_id: string
                    user_id: string | null
                    name: string
                    email: string | null
                    gender: string | null
                    status: 'Staff' | 'Trainee'
                    color: string | null
                    can_shop_opening: boolean
                    can_bubble_tea_making: boolean
                    can_shop_closing: boolean
                    skill_shop_opening: number | null
                    skill_bubble_tea_making: number | null
                    skill_shop_closing: number | null
                    hour_limit_type: 'weekly' | 'monthly'
                    hour_limit_value: number
                    hour_limit_reason: string | null
                    is_active: boolean
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    shop_id: string
                    user_id?: string | null
                    name: string
                    email?: string | null
                    gender?: string | null
                    status: 'Staff' | 'Trainee'
                    color?: string | null
                    can_shop_opening?: boolean
                    can_bubble_tea_making?: boolean
                    can_shop_closing?: boolean
                    skill_shop_opening?: number | null
                    skill_bubble_tea_making?: number | null
                    skill_shop_closing?: number | null
                    hour_limit_type?: 'weekly' | 'monthly'
                    hour_limit_value: number
                    hour_limit_reason?: string | null
                    is_active?: boolean
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    shop_id?: string
                    user_id?: string | null
                    name?: string
                    email?: string | null
                    gender?: string | null
                    status?: 'Staff' | 'Trainee'
                    color?: string | null
                    can_shop_opening?: boolean
                    can_bubble_tea_making?: boolean
                    can_shop_closing?: boolean
                    skill_shop_opening?: number | null
                    skill_bubble_tea_making?: number | null
                    skill_shop_closing?: number | null
                    hour_limit_type?: 'weekly' | 'monthly'
                    hour_limit_value?: number
                    hour_limit_reason?: string | null
                    is_active?: boolean
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            shift_periods: {
                Row: {
                    id: string
                    shop_id: string
                    label: string
                    start_time: string
                    end_time: string
                    day_type: 'weekday' | 'weekend' | 'special'
                }
                Insert: {
                    id?: string
                    shop_id: string
                    label: string
                    start_time: string
                    end_time: string
                    day_type: 'weekday' | 'weekend' | 'special'
                }
                Update: {
                    id?: string
                    shop_id?: string
                    label?: string
                    start_time?: string
                    end_time?: string
                    day_type?: 'weekday' | 'weekend' | 'special'
                }
            }
            staffing_rules: {
                Row: {
                    id: string
                    shop_id: string
                    day_type: 'weekday' | 'weekend' | 'special'
                    shift_period_id: string
                    staff_count: number
                }
                Insert: {
                    id?: string
                    shop_id: string
                    day_type: 'weekday' | 'weekend' | 'special'
                    shift_period_id: string
                    staff_count: number
                }
                Update: {
                    id?: string
                    shop_id?: string
                    day_type?: 'weekday' | 'weekend' | 'special'
                    shift_period_id?: string
                    staff_count?: number
                }
            }
            schedules: {
                Row: {
                    id: string
                    shop_id: string
                    week_start_date: string // YYYY-MM-DD
                    status: 'draft' | 'ai_generated' | 'edited' | 'published'
                    created_by: string | null
                    published_at: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    shop_id: string
                    week_start_date: string
                    status?: 'draft' | 'ai_generated' | 'edited' | 'published'
                    created_by?: string | null
                    published_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    shop_id?: string
                    week_start_date?: string
                    status?: 'draft' | 'ai_generated' | 'edited' | 'published'
                    created_by?: string | null
                    published_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            shifts: {
                Row: {
                    id: string
                    schedule_id: string
                    shift_period_id: string | null
                    staff_id: string | null
                    date: string // YYYY-MM-DD
                    start_time: string // ISO timestamp, or date + time
                    end_time: string // ISO timestamp
                    duration_hours: number
                    role_type: string | null
                    ai_confidence: number | null
                    ai_reasoning: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    schedule_id: string
                    shift_period_id?: string | null
                    staff_id?: string | null
                    date: string
                    start_time: string
                    end_time: string
                    duration_hours: number
                    role_type?: string | null
                    ai_confidence?: number | null
                    ai_reasoning?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    schedule_id?: string
                    shift_period_id?: string | null
                    staff_id?: string | null
                    date?: string
                    start_time?: string
                    end_time?: string
                    duration_hours?: number
                    role_type?: string | null
                    ai_confidence?: number | null
                    ai_reasoning?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            staff_availability: {
                Row: {
                    id: string
                    staff_id: string
                    day_of_week: number
                    start_time: string
                    end_time: string
                    is_available: boolean
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    staff_id: string
                    day_of_week: number
                    start_time: string
                    end_time: string
                    is_available?: boolean
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    staff_id?: string
                    day_of_week?: number
                    start_time?: string
                    end_time?: string
                    is_available?: boolean
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
