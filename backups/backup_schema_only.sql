--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'INFO',
    'TICKET_CREATED',
    'TICKET_ASSIGNED',
    'STATUS_CHANGED',
    'COMMENT_ADDED',
    'TICKET_RESOLVED',
    'TICKET_CLOSED',
    'TICKET_CANCELLED'
);


--
-- Name: ticket_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ticket_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


--
-- Name: ticket_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ticket_status AS ENUM (
    'OPEN',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
    'CANCELLED'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'EMPLOYEE',
    'TECHNICIAN',
    'ADMINISTRATOR'
);


--
-- Name: update_timestamp_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_timestamp_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ticket_id uuid,
    title character varying(150) NOT NULL,
    message text NOT NULL,
    type public.notification_type DEFAULT 'INFO'::public.notification_type NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at timestamp(6) with time zone
);


--
-- Name: ticket_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    technician_id uuid NOT NULL,
    assigned_by uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    unassigned_at timestamp with time zone,
    is_current boolean DEFAULT true NOT NULL,
    notes text,
    CONSTRAINT chk_assignments_timeline CHECK (((unassigned_at IS NULL) OR (unassigned_at >= assigned_at)))
);


--
-- Name: ticket_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ticket_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ticket_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    changed_by uuid NOT NULL,
    previous_status public.ticket_status,
    new_status public.ticket_status NOT NULL,
    changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason text
);


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_number character varying(20) DEFAULT ('TKT-'::text || lpad((nextval('public.ticket_number_seq'::regclass))::text, 6, '0'::text)) NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    category_id uuid NOT NULL,
    priority public.ticket_priority DEFAULT 'MEDIUM'::public.ticket_priority NOT NULL,
    status public.ticket_status DEFAULT 'OPEN'::public.ticket_status NOT NULL,
    employee_id uuid NOT NULL,
    department_id uuid NOT NULL,
    resolution text,
    resolved_by uuid,
    closed_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at timestamp with time zone,
    closed_at timestamp with time zone,
    CONSTRAINT chk_tickets_resolution_required CHECK (((status <> ALL (ARRAY['RESOLVED'::public.ticket_status, 'CLOSED'::public.ticket_status])) OR ((resolution IS NOT NULL) AND (length(TRIM(BOTH FROM resolution)) > 0)))),
    CONSTRAINT chk_tickets_timestamps CHECK ((((resolved_at IS NULL) OR (resolved_at >= created_at)) AND ((closed_at IS NULL) OR (closed_at >= created_at))))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role DEFAULT 'EMPLOYEE'::public.user_role NOT NULL,
    department_id uuid NOT NULL,
    employee_id character varying(50),
    phone_number character varying(30),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_users_email_format CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))
);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: ticket_assignments ticket_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT ticket_assignments_pkey PRIMARY KEY (id);


--
-- Name: ticket_comments ticket_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_pkey PRIMARY KEY (id);


--
-- Name: ticket_status_history ticket_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_status_history
    ADD CONSTRAINT ticket_status_history_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_assignments_technician; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assignments_technician ON public.ticket_assignments USING btree (technician_id, is_current);


--
-- Name: idx_assignments_ticket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assignments_ticket_id ON public.ticket_assignments USING btree (ticket_id);


--
-- Name: idx_categories_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_is_active ON public.categories USING btree (is_active);


--
-- Name: idx_comments_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_author_id ON public.ticket_comments USING btree (author_id);


--
-- Name: idx_comments_ticket_internal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_ticket_internal ON public.ticket_comments USING btree (ticket_id, is_internal);


--
-- Name: idx_departments_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_is_active ON public.departments USING btree (is_active);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_status_history_changed_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_status_history_changed_by ON public.ticket_status_history USING btree (changed_by);


--
-- Name: idx_status_history_ticket; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_status_history_ticket ON public.ticket_status_history USING btree (ticket_id, changed_at);


--
-- Name: idx_tickets_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_category_id ON public.tickets USING btree (category_id);


--
-- Name: idx_tickets_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_created_at ON public.tickets USING btree (created_at DESC);


--
-- Name: idx_tickets_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_department_id ON public.tickets USING btree (department_id);


--
-- Name: idx_tickets_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_employee_id ON public.tickets USING btree (employee_id);


--
-- Name: idx_tickets_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_priority ON public.tickets USING btree (priority);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- Name: idx_tickets_ticket_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_ticket_number ON public.tickets USING btree (ticket_number);


--
-- Name: idx_users_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_department_id ON public.users USING btree (department_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_employee_id ON public.users USING btree (employee_id);


--
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: categories trg_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: ticket_comments trg_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON public.ticket_comments FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: departments trg_departments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: tickets trg_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: ticket_assignments fk_assignments_assigned_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT fk_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ticket_assignments fk_assignments_technician; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT fk_assignments_technician FOREIGN KEY (technician_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ticket_assignments fk_assignments_ticket; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT fk_assignments_ticket FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ticket_comments fk_comments_author; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ticket_comments fk_comments_ticket; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT fk_comments_ticket FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications fk_notifications_ticket; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_ticket FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications fk_notifications_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ticket_status_history fk_status_history_changed_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_status_history
    ADD CONSTRAINT fk_status_history_changed_by FOREIGN KEY (changed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ticket_status_history fk_status_history_ticket; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_status_history
    ADD CONSTRAINT fk_status_history_ticket FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets fk_tickets_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT fk_tickets_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets fk_tickets_closed_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT fk_tickets_closed_by FOREIGN KEY (closed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets fk_tickets_department; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT fk_tickets_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets fk_tickets_employee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT fk_tickets_employee FOREIGN KEY (employee_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets fk_tickets_resolved_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT fk_tickets_resolved_by FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users fk_users_department; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--


