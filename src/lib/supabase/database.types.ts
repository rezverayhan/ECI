export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      car_bookings: {
        Row: {
          admin_action: string | null
          admin_action_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          car_id: string
          created_at: string
          destination: string | null
          end_at: string
          id: string
          purpose: string | null
          start_at: string
          status: Database["public"]["Enums"]["booking_status_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_action?: string | null
          admin_action_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          car_id: string
          created_at?: string
          destination?: string | null
          end_at: string
          id?: string
          purpose?: string | null
          start_at: string
          status?: Database["public"]["Enums"]["booking_status_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_action?: string | null
          admin_action_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          car_id?: string
          created_at?: string
          destination?: string | null
          end_at?: string
          id?: string
          purpose?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["booking_status_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          created_at: string
          driver_information: string | null
          id: string
          model: string | null
          name: string
          notes: string | null
          registration_number: string | null
          status: Database["public"]["Enums"]["resource_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          driver_information?: string | null
          id?: string
          model?: string | null
          name: string
          notes?: string | null
          registration_number?: string | null
          status?: Database["public"]["Enums"]["resource_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          driver_information?: string | null
          id?: string
          model?: string | null
          name?: string
          notes?: string | null
          registration_number?: string | null
          status?: Database["public"]["Enums"]["resource_status_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      designations: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_status: Database["public"]["Enums"]["assignment_state_enum"]
          created_at: string
          device_id: string
          id: string
          notes: string | null
          replacement_reason: string | null
          returned_at: string | null
          returned_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_state_enum"]
          created_at?: string
          device_id: string
          id?: string
          notes?: string | null
          replacement_reason?: string | null
          returned_at?: string | null
          returned_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_state_enum"]
          created_at?: string
          device_id?: string
          id?: string
          notes?: string | null
          replacement_reason?: string | null
          returned_at?: string | null
          returned_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_assignments_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_assignments_returned_by_fkey"
            columns: ["returned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      device_service_records: {
        Row: {
          completed_date: string | null
          cost: number | null
          created_at: string
          created_by: string | null
          description: string | null
          device_id: string
          id: string
          notes: string | null
          problem: string | null
          provider: string | null
          resolution: string | null
          service_center: string | null
          service_date: string
          service_type: Database["public"]["Enums"]["service_type_enum"]
          status: Database["public"]["Enums"]["service_status_enum"]
          technician: string | null
          updated_at: string
          warranty_covered: boolean | null
        }
        Insert: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          device_id: string
          id?: string
          notes?: string | null
          problem?: string | null
          provider?: string | null
          resolution?: string | null
          service_center?: string | null
          service_date?: string
          service_type: Database["public"]["Enums"]["service_type_enum"]
          status?: Database["public"]["Enums"]["service_status_enum"]
          technician?: string | null
          updated_at?: string
          warranty_covered?: boolean | null
        }
        Update: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          device_id?: string
          id?: string
          notes?: string | null
          problem?: string | null
          provider?: string | null
          resolution?: string | null
          service_center?: string | null
          service_date?: string
          service_type?: Database["public"]["Enums"]["service_type_enum"]
          status?: Database["public"]["Enums"]["service_status_enum"]
          technician?: string | null
          updated_at?: string
          warranty_covered?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "device_service_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_service_records_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          asset_id: string
          brand: string | null
          created_at: string
          deleted_at: string | null
          device_type: Database["public"]["Enums"]["device_type_enum"]
          id: string
          model: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          purchased_by: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status_enum"]
          updated_at: string
          warranty_duration_months: number | null
          warranty_end_date: string | null
          warranty_start_date: string | null
        }
        Insert: {
          asset_id: string
          brand?: string | null
          created_at?: string
          deleted_at?: string | null
          device_type: Database["public"]["Enums"]["device_type_enum"]
          id?: string
          model: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          purchased_by?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status_enum"]
          updated_at?: string
          warranty_duration_months?: number | null
          warranty_end_date?: string | null
          warranty_start_date?: string | null
        }
        Update: {
          asset_id?: string
          brand?: string | null
          created_at?: string
          deleted_at?: string | null
          device_type?: Database["public"]["Enums"]["device_type_enum"]
          id?: string
          model?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          purchased_by?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status_enum"]
          updated_at?: string
          warranty_duration_months?: number | null
          warranty_end_date?: string | null
          warranty_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_addresses: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown
          notes: string | null
          reserved_for: string | null
          status: Database["public"]["Enums"]["ip_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: unknown
          notes?: string | null
          reserved_for?: string | null
          status?: Database["public"]["Enums"]["ip_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          notes?: string | null
          reserved_for?: string | null
          status?: Database["public"]["Enums"]["ip_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_addresses_reserved_for_fkey"
            columns: ["reserved_for"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_status: Database["public"]["Enums"]["assignment_state_enum"]
          created_at: string
          id: string
          ip_address_id: string
          notes: string | null
          released_at: string | null
          released_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_state_enum"]
          created_at?: string
          id?: string
          ip_address_id: string
          notes?: string | null
          released_at?: string | null
          released_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_state_enum"]
          created_at?: string
          id?: string
          ip_address_id?: string
          notes?: string | null
          released_at?: string | null
          released_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_assignments_ip_address_id_fkey"
            columns: ["ip_address_id"]
            isOneToOne: false
            referencedRelation: "ip_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_assignments_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_phone_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_status: Database["public"]["Enums"]["assignment_state_enum"]
          created_at: string
          id: string
          ip_phone_id: string
          notes: string | null
          released_at: string | null
          released_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_state_enum"]
          created_at?: string
          id?: string
          ip_phone_id: string
          notes?: string | null
          released_at?: string | null
          released_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_state_enum"]
          created_at?: string
          id?: string
          ip_phone_id?: string
          notes?: string | null
          released_at?: string | null
          released_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_phone_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_phone_assignments_ip_phone_id_fkey"
            columns: ["ip_phone_id"]
            isOneToOne: false
            referencedRelation: "ip_phones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_phone_assignments_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_phone_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_phones: {
        Row: {
          created_at: string
          department_id: string | null
          extension: string
          id: string
          notes: string | null
          phone_type: string | null
          status: Database["public"]["Enums"]["ip_phone_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          extension: string
          id?: string
          notes?: string | null
          phone_type?: string | null
          status?: Database["public"]["Enums"]["ip_phone_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          extension?: string
          id?: string
          notes?: string | null
          phone_type?: string | null
          status?: Database["public"]["Enums"]["ip_phone_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_phones_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      license_renewals: {
        Row: {
          created_at: string
          id: string
          new_expiry_date: string
          notes: string | null
          previous_expiry_date: string | null
          renewed_by: string | null
          renewed_on: string
          user_id: string
          user_license_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_expiry_date: string
          notes?: string | null
          previous_expiry_date?: string | null
          renewed_by?: string | null
          renewed_on?: string
          user_id: string
          user_license_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_expiry_date?: string
          notes?: string | null
          previous_expiry_date?: string | null
          renewed_by?: string | null
          renewed_on?: string
          user_id?: string
          user_license_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_renewals_renewed_by_fkey"
            columns: ["renewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_renewals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_renewals_user_license_id_fkey"
            columns: ["user_license_id"]
            isOneToOne: false
            referencedRelation: "user_licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_profiles: {
        Row: {
          created_at: string
          id: string
          machine_name: string
          notes: string | null
          operating_system: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          machine_name: string
          notes?: string | null
          operating_system?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          machine_name?: string
          notes?: string | null
          operating_system?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "machine_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_room_bookings: {
        Row: {
          admin_action: string | null
          admin_action_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          end_at: string
          id: string
          meeting_room_id: string
          purpose: string | null
          start_at: string
          status: Database["public"]["Enums"]["booking_status_enum"]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_action?: string | null
          admin_action_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          end_at: string
          id?: string
          meeting_room_id: string
          purpose?: string | null
          start_at: string
          status?: Database["public"]["Enums"]["booking_status_enum"]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_action?: string | null
          admin_action_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          end_at?: string
          id?: string
          meeting_room_id?: string
          purpose?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["booking_status_enum"]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_room_bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_room_bookings_meeting_room_id_fkey"
            columns: ["meeting_room_id"]
            isOneToOne: false
            referencedRelation: "meeting_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_room_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_rooms: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          status: Database["public"]["Enums"]["resource_status_enum"]
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          status?: Database["public"]["Enums"]["resource_status_enum"]
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          status?: Database["public"]["Enums"]["resource_status_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          notification_type: string
          read_at: string | null
          recipient_user_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          notification_type: string
          read_at?: string | null
          recipient_user_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          notification_type?: string
          read_at?: string | null
          recipient_user_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      printer_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_status: Database["public"]["Enums"]["assignment_state_enum"]
          created_at: string
          id: string
          notes: string | null
          printer_id: string
          returned_at: string | null
          returned_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_state_enum"]
          created_at?: string
          id?: string
          notes?: string | null
          printer_id: string
          returned_at?: string | null
          returned_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_state_enum"]
          created_at?: string
          id?: string
          notes?: string | null
          printer_id?: string
          returned_at?: string | null
          returned_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "printer_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "printer_assignments_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "printer_assignments_returned_by_fkey"
            columns: ["returned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "printer_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      printers: {
        Row: {
          asset_id: string
          brand: string | null
          created_at: string
          deleted_at: string | null
          id: string
          model: string | null
          notes: string | null
          printer_name: string
          printer_type: string | null
          purchase_date: string | null
          purchase_price: number | null
          purchased_by: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status_enum"]
          updated_at: string
          warranty_duration_months: number | null
          warranty_end_date: string | null
          warranty_start_date: string | null
        }
        Insert: {
          asset_id: string
          brand?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          printer_name: string
          printer_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          purchased_by?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status_enum"]
          updated_at?: string
          warranty_duration_months?: number | null
          warranty_end_date?: string | null
          warranty_start_date?: string | null
        }
        Update: {
          asset_id?: string
          brand?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          printer_name?: string
          printer_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          purchased_by?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status_enum"]
          updated_at?: string
          warranty_duration_months?: number | null
          warranty_end_date?: string | null
          warranty_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "printers_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh_key: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh_key: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh_key?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_issue_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          issue_id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          issue_id: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          issue_id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_issue_attachments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "support_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_issue_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_issue_internal_notes: {
        Row: {
          created_at: string
          internal_notes: string | null
          issue_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          internal_notes?: string | null
          issue_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          internal_notes?: string | null
          issue_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_issue_internal_notes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: true
            referencedRelation: "support_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_issue_internal_notes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_issue_updates: {
        Row: {
          actor_user_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_internal: boolean
          issue_id: string
          new_status: Database["public"]["Enums"]["support_status_enum"] | null
          old_status: Database["public"]["Enums"]["support_status_enum"] | null
          update_type: string
        }
        Insert: {
          actor_user_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_internal?: boolean
          issue_id: string
          new_status?: Database["public"]["Enums"]["support_status_enum"] | null
          old_status?: Database["public"]["Enums"]["support_status_enum"] | null
          update_type: string
        }
        Update: {
          actor_user_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_internal?: boolean
          issue_id?: string
          new_status?: Database["public"]["Enums"]["support_status_enum"] | null
          old_status?: Database["public"]["Enums"]["support_status_enum"] | null
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_issue_updates_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_issue_updates_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "support_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      support_issues: {
        Row: {
          acknowledged_at: string | null
          assigned_to: string | null
          category: Database["public"]["Enums"]["support_category_enum"]
          closed_at: string | null
          created_at: string
          description: string | null
          id: string
          issue_number: string
          priority: Database["public"]["Enums"]["support_priority_enum"]
          resolution: string | null
          resolved_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["support_status_enum"]
          submitted_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_to?: string | null
          category: Database["public"]["Enums"]["support_category_enum"]
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          issue_number?: string
          priority?: Database["public"]["Enums"]["support_priority_enum"]
          resolution?: string | null
          resolved_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["support_status_enum"]
          submitted_at?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["support_category_enum"]
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          issue_number?: string
          priority?: Database["public"]["Enums"]["support_priority_enum"]
          resolution?: string | null
          resolved_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["support_status_enum"]
          submitted_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_issues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_applications: {
        Row: {
          application_id: string
          assigned_date: string | null
          created_at: string
          id: string
          license_status: string | null
          license_type: string | null
          notes: string | null
          renewal_date: string | null
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          application_id: string
          assigned_date?: string | null
          created_at?: string
          id?: string
          license_status?: string | null
          license_type?: string | null
          notes?: string | null
          renewal_date?: string | null
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          application_id?: string
          assigned_date?: string | null
          created_at?: string
          id?: string
          license_status?: string | null
          license_type?: string | null
          notes?: string | null
          renewal_date?: string | null
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_applications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_licenses: {
        Row: {
          auto_renew: boolean
          created_at: string
          expiry_date: string | null
          id: string
          license_name: string
          license_type: string | null
          notes: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["license_status_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          expiry_date?: string | null
          id?: string
          license_name: string
          license_type?: string | null
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["license_status_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          expiry_date?: string | null
          id?: string
          license_name?: string
          license_type?: string | null
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["license_status_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level_enum"]
          auth_user_id: string | null
          created_at: string
          deleted_at: string | null
          department_id: string
          designation_id: string | null
          employee_id: string | null
          employment_status: Database["public"]["Enums"]["employment_status_enum"]
          full_name: string
          id: string
          is_active: boolean
          join_date: string | null
          manager_id: string | null
          official_email: string
          phone: string | null
          profile_photo_path: string | null
          resign_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level_enum"]
          auth_user_id?: string | null
          created_at?: string
          deleted_at?: string | null
          department_id: string
          designation_id?: string | null
          employee_id?: string | null
          employment_status?: Database["public"]["Enums"]["employment_status_enum"]
          full_name: string
          id?: string
          is_active?: boolean
          join_date?: string | null
          manager_id?: string | null
          official_email: string
          phone?: string | null
          profile_photo_path?: string | null
          resign_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level_enum"]
          auth_user_id?: string | null
          created_at?: string
          deleted_at?: string | null
          department_id?: string
          designation_id?: string | null
          employee_id?: string | null
          employment_status?: Database["public"]["Enums"]["employment_status_enum"]
          full_name?: string
          id?: string
          is_active?: boolean
          join_date?: string | null
          manager_id?: string | null
          official_email?: string
          phone?: string | null
          profile_photo_path?: string | null
          resign_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_access_level: {
        Args: never
        Returns: Database["public"]["Enums"]["access_level_enum"]
      }
      current_user_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_general_manager: { Args: never; Returns: boolean }
      is_general_user: { Args: never; Returns: boolean }
      is_it_administrator: { Args: never; Returns: boolean }
      search_users: {
        Args: {
          p_department_id?: string
          p_designation_id?: string
          p_employment_status?: Database["public"]["Enums"]["employment_status_enum"]
          p_limit?: number
          p_manager_id?: string
          p_offset?: number
          p_query?: string
          p_sort_by?: string
          p_sort_dir?: string
        }
        Returns: {
          access_level: Database["public"]["Enums"]["access_level_enum"]
          department_id: string
          department_name: string
          designation_id: string
          designation_name: string
          employee_id: string
          employment_status: Database["public"]["Enums"]["employment_status_enum"]
          full_name: string
          id: string
          is_active: boolean
          join_date: string
          manager_id: string
          manager_name: string
          official_email: string
          phone: string
          profile_photo_path: string
          total_count: number
          user_id: string
        }[]
      }
    }
    Enums: {
      access_level_enum:
        | "it_administrator"
        | "general_manager"
        | "admin"
        | "general_user"
      asset_status_enum:
        | "assigned"
        | "available"
        | "under_service"
        | "returned"
        | "retired"
      assignment_state_enum: "active" | "ended"
      booking_status_enum:
        | "confirmed"
        | "pending"
        | "paused"
        | "cancelled"
        | "denied"
        | "completed"
      device_type_enum: "laptop" | "desktop" | "tablet" | "other"
      employment_status_enum: "active" | "inactive" | "resigned"
      ip_phone_status_enum: "active" | "inactive"
      ip_status_enum: "free" | "assigned" | "reserved" | "unavailable"
      license_status_enum: "active" | "upcoming" | "due" | "expired"
      resource_status_enum: "available" | "unavailable" | "maintenance"
      service_status_enum: "open" | "in_progress" | "completed" | "cancelled"
      service_type_enum:
        | "repair"
        | "maintenance"
        | "diagnostic"
        | "upgrade"
        | "other"
      support_category_enum:
        | "laptop_computer"
        | "network_lan"
        | "internet"
        | "ip_address"
        | "ip_phone"
        | "software"
        | "access"
        | "hardware"
        | "printer_peripheral"
        | "other"
      support_priority_enum: "low" | "medium" | "high" | "urgent"
      support_status_enum:
        | "submitted"
        | "acknowledged"
        | "in_progress"
        | "waiting_on_hold"
        | "resolved"
        | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_level_enum: [
        "it_administrator",
        "general_manager",
        "admin",
        "general_user",
      ],
      asset_status_enum: [
        "assigned",
        "available",
        "under_service",
        "returned",
        "retired",
      ],
      assignment_state_enum: ["active", "ended"],
      booking_status_enum: [
        "confirmed",
        "pending",
        "paused",
        "cancelled",
        "denied",
        "completed",
      ],
      device_type_enum: ["laptop", "desktop", "tablet", "other"],
      employment_status_enum: ["active", "inactive", "resigned"],
      ip_phone_status_enum: ["active", "inactive"],
      ip_status_enum: ["free", "assigned", "reserved", "unavailable"],
      license_status_enum: ["active", "upcoming", "due", "expired"],
      resource_status_enum: ["available", "unavailable", "maintenance"],
      service_status_enum: ["open", "in_progress", "completed", "cancelled"],
      service_type_enum: [
        "repair",
        "maintenance",
        "diagnostic",
        "upgrade",
        "other",
      ],
      support_category_enum: [
        "laptop_computer",
        "network_lan",
        "internet",
        "ip_address",
        "ip_phone",
        "software",
        "access",
        "hardware",
        "printer_peripheral",
        "other",
      ],
      support_priority_enum: ["low", "medium", "high", "urgent"],
      support_status_enum: [
        "submitted",
        "acknowledged",
        "in_progress",
        "waiting_on_hold",
        "resolved",
        "closed",
      ],
    },
  },
} as const
