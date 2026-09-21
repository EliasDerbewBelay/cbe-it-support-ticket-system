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
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories VALUES ('a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hardware & Workstations', 'Desktop PC, laptops, monitors, scanners, and peripheral equipment', true, '2026-09-14 13:30:22.124763+03', '2026-09-18 10:31:26.931723+03');
INSERT INTO public.categories VALUES ('a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Software & Applications', 'Operating systems, office suites, banking applications, and software errors', true, '2026-09-14 13:30:22.124763+03', '2026-09-18 10:31:26.942974+03');
INSERT INTO public.categories VALUES ('a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Network & Connectivity', 'Branch LAN, Wi-Fi, VPN, and network gateway connectivity', true, '2026-09-14 13:30:22.124763+03', '2026-09-18 10:31:26.946021+03');
INSERT INTO public.categories VALUES ('a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Printers & Passbook Units', 'Receipt printers, passbook printers, heavy-duty office printers, and scanners', true, '2026-09-14 13:30:22.124763+03', '2026-09-18 10:31:26.949135+03');
INSERT INTO public.categories VALUES ('a5555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Email & Messaging', 'Institutional mailbox configuration, Outlook issues, mailbox quotas, and email sync', true, '2026-09-14 13:30:22.124763+03', '2026-09-18 10:31:26.951915+03');
INSERT INTO public.categories VALUES ('a6666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'System Access & Permissions', 'Active Directory permissions, shared network drives, ERP, and portal access', true, '2026-09-14 13:30:22.124763+03', '2026-09-18 10:31:26.955127+03');
INSERT INTO public.categories VALUES ('a7777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'User Accounts & Passwords', 'Password resets, account lockouts, credential renewals, and login assistance', true, '2026-09-14 13:30:22.124763+03', '2026-09-18 10:31:26.958527+03');
INSERT INTO public.categories VALUES ('a8888888-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Security & Antivirus', 'Suspected phishing emails, malware alerts, antivirus updates, and security compliance', true, '2026-09-14 13:30:22.124763+03', '2026-09-18 10:31:26.962316+03');
INSERT INTO public.categories VALUES ('a9999999-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'General IT Inquiries', 'General IT questions, technical consultations, and miscellaneous support requests', true, '2026-09-14 13:30:22.124763+03', '2026-09-18 10:31:26.966346+03');
INSERT INTO public.categories VALUES ('7c6163cc-1ba3-4c39-953f-2f0bc033c675', 'Core Banking & Terminals', 'Core banking platform, teller counter workstations, and transaction peripherals', true, '2026-09-14 15:15:16.725+03', '2026-09-18 10:31:26.969677+03');


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.departments VALUES ('11111111-1111-1111-1111-111111111111', 'Information Systems', 'IT Infrastructure, Systems Support & Helpdesk', true, '2026-09-14 13:30:22.124763+03', '2026-09-14 13:30:22.124763+03');
INSERT INTO public.departments VALUES ('22222222-2222-2222-2222-222222222222', 'Finance & Accounts', 'Financial Planning, Budgeting and Payroll Operations', true, '2026-09-14 13:30:22.124763+03', '2026-09-14 13:30:22.124763+03');
INSERT INTO public.departments VALUES ('33333333-3333-3333-3333-333333333333', 'Human Resources', 'Talent Acquisition, Employee Relations and Personnel', true, '2026-09-14 13:30:22.124763+03', '2026-09-14 13:30:22.124763+03');
INSERT INTO public.departments VALUES ('44444444-4444-4444-4444-444444444444', 'Retail Banking', 'Branch Banking, Customer Accounts and Counter Services', true, '2026-09-14 13:30:22.124763+03', '2026-09-14 13:30:22.124763+03');
INSERT INTO public.departments VALUES ('55555555-5555-5555-5555-555555555555', 'Operations & Clearing', 'Cheque Clearing, Swift Services and Reconciliation', true, '2026-09-14 13:30:22.124763+03', '2026-09-14 13:30:22.124763+03');
INSERT INTO public.departments VALUES ('66666666-6666-6666-6666-666666666666', 'Customer Service', 'Call Centre, Help Desk and Inquiries Management', true, '2026-09-14 13:30:22.124763+03', '2026-09-14 13:30:22.124763+03');
INSERT INTO public.departments VALUES ('d33f3086-41dd-4e1d-bba4-9c57050de207', 'Core Banking Systems-1059', 'Updated description for Core Banking division', true, '2026-09-14 15:15:16.603+03', '2026-09-14 15:15:16.666693+03');
INSERT INTO public.departments VALUES ('7b969594-9915-40c2-9488-0566a365a737', 'Core Banking Systems-7264', 'Updated description for Core Banking division', true, '2026-09-14 15:52:26.216+03', '2026-09-14 15:52:26.280057+03');
INSERT INTO public.departments VALUES ('a058514b-d97e-4f65-81e1-c5377ba49f0a', 'Core Banking Systems-6379', 'Updated description for Core Banking division', true, '2026-09-14 15:58:46.64+03', '2026-09-14 15:58:46.707358+03');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Abebe', 'Admin', 'admin.is@cbe.com.et', '$2b$12$zIwcCxZBxOzVi7ZTQqUucOqlD06bG.0B4Hf2lRe/ZleihxaBIF1ui', 'ADMINISTRATOR', '11111111-1111-1111-1111-111111111111', 'CBE-EMP-001', '+251-11-551-0001', true, '2026-09-14 13:30:22.124763+03', '2026-09-14 14:12:58.505466+03');
INSERT INTO public.users VALUES ('b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tadesse', 'Tech', 'tech.support@cbe.com.et', '$2b$12$zIwcCxZBxOzVi7ZTQqUucOqlD06bG.0B4Hf2lRe/ZleihxaBIF1ui', 'TECHNICIAN', '11111111-1111-1111-1111-111111111111', 'CBE-EMP-002', '+251-11-551-0002', true, '2026-09-14 13:30:22.124763+03', '2026-09-14 14:12:58.505466+03');
INSERT INTO public.users VALUES ('b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Chaltu', 'Employee', 'chaltu.finance@cbe.com.et', '$2b$12$zIwcCxZBxOzVi7ZTQqUucOqlD06bG.0B4Hf2lRe/ZleihxaBIF1ui', 'EMPLOYEE', '22222222-2222-2222-2222-222222222222', 'CBE-EMP-003', '+251-11-551-0003', true, '2026-09-14 13:30:22.124763+03', '2026-09-14 14:12:58.505466+03');
INSERT INTO public.users VALUES ('a24b1e7e-2ca7-4db9-b50a-cd018f103b1b', 'Tigist', 'Kebede', 'tigist.k7234@cbe.com.et', '$2b$12$d7AZeVbAKOgOQPJQa22MR.ISZI1xjJcV4fJQg6sKT.gSmXL1DaKBu', 'TECHNICIAN', '11111111-1111-1111-1111-111111111111', 'TECH-7234', '+2519117234', true, '2026-09-14 15:14:05.837+03', '2026-09-14 15:14:05.837+03');
INSERT INTO public.users VALUES ('c91dc3d9-44c5-441e-910a-112423f50aae', 'Tigist', 'Kebede', 'tigist.k1059@cbe.com.et', '$2b$12$eKsF9/AsnIjP6NIwv4hl2Odom9ZL4pnbXrJ2feWf3KJbYI4uvVnXe', 'TECHNICIAN', '11111111-1111-1111-1111-111111111111', 'TECH-1059', '+251922334455', true, '2026-09-14 15:15:16.384+03', '2026-09-14 15:15:16.473373+03');
INSERT INTO public.users VALUES ('d3e985ce-cc18-4992-8480-0ac2585a391e', 'Dawit', 'Haile', 'dawit.tech6332@cbe.com.et', '$2b$12$r3XQ/vmtRURBWnqYmaPfC.sdUcgYrZV7UK1HygFe0atVDH54HRuZi', 'TECHNICIAN', '11111111-1111-1111-1111-111111111111', 'TECH2-6332', '+251911888999', true, '2026-09-14 15:49:13.806+03', '2026-09-14 15:49:13.806+03');
INSERT INTO public.users VALUES ('c693c3ab-2c38-408d-97b5-b178a87cf3d9', 'Dawit', 'Haile', 'dawit.tech4635@cbe.com.et', '$2b$12$Yk70wjug1H281Lwg7rx5iOemhIZtLmcVUOTpiq8542Gy5jkQIQ/yi', 'TECHNICIAN', '11111111-1111-1111-1111-111111111111', 'TECH2-4635', '+251911888999', true, '2026-09-14 15:52:08.002+03', '2026-09-14 15:52:08.002+03');
INSERT INTO public.users VALUES ('a524b597-386a-4738-a856-41d6d8a91717', 'Tigist', 'Kebede', 'tigist.k7264@cbe.com.et', '$2b$12$VuOPoQLvp6VwI9NCN74sv.c9gmivAqE9shxzecL67R55O4jBCKSUm', 'TECHNICIAN', '11111111-1111-1111-1111-111111111111', 'TECH-7264', '+251922334455', true, '2026-09-14 15:52:26.026+03', '2026-09-14 15:52:26.109826+03');
INSERT INTO public.users VALUES ('53236d4e-5893-4b8c-b2fe-6189e5ed739c', 'Tigist', 'Kebede', 'tigist.k6379@cbe.com.et', '$2b$12$H.pK6INdzyjfT0DzL/RY.ubxhEOiOHYEYX5tmfn.kPyBCzuvAr1gm', 'TECHNICIAN', '11111111-1111-1111-1111-111111111111', 'TECH-6379', '+251922334455', true, '2026-09-14 15:58:46.444+03', '2026-09-14 15:58:46.535647+03');
INSERT INTO public.users VALUES ('c700108d-6241-4027-b0b5-5e639cd60b7a', 'Dawit', 'Haile', 'dawit.tech3366@cbe.com.et', '$2b$12$ZpQNaunlACWlDwqV51XIhOFbn7ddINVFZIF9RG/WWpcSztAfzmqqO', 'TECHNICIAN', '11111111-1111-1111-1111-111111111111', 'TECH2-3366', '+251911888999', true, '2026-09-14 15:58:56.051+03', '2026-09-21 15:30:44.32098+03');


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tickets VALUES ('5763137f-fdb7-4bb5-9836-08ae25125e19', 'TKT-000016', 'Core Banking Terminal disconnected from LAN', 'Branch teller PC-03 is experiencing persistent Socket 10054 connection timeout errors when connecting to the core banking server gateway.', '7c6163cc-1ba3-4c39-953f-2f0bc033c675', 'HIGH', 'RESOLVED', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Replaced the damaged wires', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, '2026-09-21 15:25:42.095+03', '2026-09-21 15:29:00.392589+03', '2026-09-21 15:29:00.391+03', NULL);
INSERT INTO public.tickets VALUES ('1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'TKT-000013', 'Branch Passbook / Receipt Printer Paper Feed Malfunction', 'The teller counter passbook printer is showing red hardware fault LED and failing to feed deposit slips.', 'a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MEDIUM', 'RESOLVED', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'I have fixed the issue, now you can use the network safely', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, '2026-09-15 09:38:18.446+03', '2026-09-18 10:31:26.972862+03', '2026-09-15 09:40:12.819+03', NULL);
INSERT INTO public.tickets VALUES ('39366b23-a976-4aa2-891b-e1d0bcec7b51', 'TKT-000012', 'Core Banking Terminal disconnected from LAN', 'Branch teller PC-03 is experiencing persistent Socket 10054 connection timeout errors when connecting to the core banking server gateway.', '7c6163cc-1ba3-4c39-953f-2f0bc033c675', 'CRITICAL', 'RESOLVED', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Replaced the damaged cable', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, '2026-09-14 23:52:27.526+03', '2026-09-18 10:31:26.980716+03', '2026-09-15 08:01:50.278+03', NULL);
INSERT INTO public.tickets VALUES ('a48c4333-5905-470c-bc54-fc2abbe368cf', 'TKT-000014', 'My pc does not work', 'My Portal does show me the error', 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HIGH', 'RESOLVED', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Resolved the error by connecting with correct cables', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, '2026-09-18 11:25:03.251+03', '2026-09-18 11:27:34.266447+03', '2026-09-18 11:27:34.265+03', NULL);
INSERT INTO public.tickets VALUES ('d0605b97-7ba3-459d-8dd3-4ca437421d6d', 'TKT-000015', 'Branch Passbook / Receipt Printer Paper Feed Malfunction', 'The teller counter passbook printer is showing red hardware fault LED and failing to feed deposit slips.', '7c6163cc-1ba3-4c39-953f-2f0bc033c675', 'MEDIUM', 'OPEN', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', NULL, NULL, NULL, '2026-09-18 11:39:03.249+03', '2026-09-18 11:39:03.249+03', NULL, NULL);


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notifications VALUES ('9f2568dc-6701-4561-8b9e-6c1e8f3156e1', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'Ticket Submitted Successfully', 'Your incident TKT-000013 ("Branch Passbook / Receipt Printer Paper Feed Malfunction") has been registered and is pending triage.', 'TICKET_CREATED', true, '2026-09-15 09:38:18.47+03', '2026-09-15 09:38:34.327+03');
INSERT INTO public.notifications VALUES ('8499ac63-5046-44a9-933b-c88b622e2c10', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'New Incident Logged', 'New ticket TKT-000013 ("Branch Passbook / Receipt Printer Paper Feed Malfunction") requires review & assignment.', 'TICKET_CREATED', true, '2026-09-15 09:38:18.487+03', '2026-09-15 09:39:06.082+03');
INSERT INTO public.notifications VALUES ('f66d2d0f-eabc-40c9-b2bd-0d82a0632d4a', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'Ticket Assigned to You', 'You have been assigned to support incident TKT-000013: "Branch Passbook / Receipt Printer Paper Feed Malfunction".', 'TICKET_ASSIGNED', true, '2026-09-15 09:39:18.53+03', '2026-09-15 09:39:45.736+03');
INSERT INTO public.notifications VALUES ('eae52ae4-c1d0-430a-879f-7e0665dbc6c7', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'Ticket TKT-000013 RESOLVED', 'Ticket TKT-000013 was marked as RESOLVED (I have fixed the issue, now you can use the network safely).', 'TICKET_RESOLVED', true, '2026-09-15 09:40:12.875+03', '2026-09-15 10:06:03.498+03');
INSERT INTO public.notifications VALUES ('b87ddb1a-2c72-432a-a0a1-0fba35d0183e', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'Incident Resolved', 'Your ticket TKT-000013 has been resolved: I have fixed the issue, now you can use the network safely', 'TICKET_RESOLVED', true, '2026-09-15 09:40:12.857+03', '2026-09-18 10:06:54.997+03');
INSERT INTO public.notifications VALUES ('a5ea512e-3811-4e23-a734-c30165fa6662', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'Work in Progress', 'Technician has begun working on your ticket TKT-000013.', 'STATUS_CHANGED', true, '2026-09-15 09:39:48.459+03', '2026-09-18 10:07:02.972+03');
INSERT INTO public.notifications VALUES ('ed34993b-0d1b-46ef-be98-161525815b22', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'Technician Assigned', 'An IS support technician has been assigned to investigate your incident TKT-000013.', 'TICKET_ASSIGNED', true, '2026-09-15 09:39:18.543+03', '2026-09-18 10:07:07.645+03');
INSERT INTO public.notifications VALUES ('94662bfb-b0f6-4dc5-801d-896515022190', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'New Incident Logged', 'New ticket TKT-000014 ("My pc does not work") requires review & assignment.', 'TICKET_CREATED', true, '2026-09-18 11:25:03.297+03', '2026-09-18 11:25:49.557+03');
INSERT INTO public.notifications VALUES ('0d84fcf8-859f-4ba1-957c-489c9ef354df', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'Ticket Assigned to You', 'You have been assigned to support incident TKT-000014: "My pc does not work".', 'TICKET_ASSIGNED', true, '2026-09-18 11:26:26.461+03', '2026-09-18 11:26:46.624+03');
INSERT INTO public.notifications VALUES ('888a839d-bcd1-4e5a-be1d-3b6c6901fb92', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'Ticket TKT-000014 RESOLVED', 'Ticket TKT-000014 was marked as RESOLVED (Resolved the error by connecting with correct cables).', 'TICKET_RESOLVED', true, '2026-09-18 11:27:34.327+03', '2026-09-18 11:38:30.519+03');
INSERT INTO public.notifications VALUES ('b8169f52-fd0a-442b-ab52-eb5649089f5c', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'd0605b97-7ba3-459d-8dd3-4ca437421d6d', 'New Incident Logged', 'New ticket TKT-000015 ("Branch Passbook / Receipt Printer Paper Feed Malfunction") requires review & assignment.', 'TICKET_CREATED', true, '2026-09-18 11:39:03.286+03', '2026-09-18 11:39:45.463+03');
INSERT INTO public.notifications VALUES ('d4232f5a-6fe4-42d5-92e9-f65d72748df3', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'New Incident Logged', 'New ticket TKT-000016 ("Core Banking Terminal disconnected from LAN") requires review & assignment.', 'TICKET_CREATED', true, '2026-09-21 15:25:42.149+03', '2026-09-21 15:26:22.574+03');
INSERT INTO public.notifications VALUES ('dedcd442-b0d6-43b2-924c-01d296f81d99', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'Ticket Assigned to You', 'You have been assigned to support incident TKT-000016: "Core Banking Terminal disconnected from LAN".', 'TICKET_ASSIGNED', true, '2026-09-21 15:26:45.977+03', '2026-09-21 15:27:11.606+03');
INSERT INTO public.notifications VALUES ('4a4f6161-8be2-440a-8eb9-bc270262611e', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'Incident Resolved', 'Your ticket TKT-000016 has been resolved: Replaced the damaged wires', 'TICKET_RESOLVED', true, '2026-09-21 15:29:00.454+03', '2026-09-21 15:29:31.114+03');
INSERT INTO public.notifications VALUES ('2b7c779d-31f7-4815-9232-61ca04229fb2', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'Work in Progress', 'Technician has begun working on your ticket TKT-000016.', 'STATUS_CHANGED', true, '2026-09-21 15:27:56.116+03', '2026-09-21 15:29:31.114+03');
INSERT INTO public.notifications VALUES ('f9ee7dc1-caf7-4380-ba41-1fbcb6b13150', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'Technician Assigned', 'An IS support technician has been assigned to investigate your incident TKT-000016.', 'TICKET_ASSIGNED', true, '2026-09-21 15:26:45.988+03', '2026-09-21 15:29:31.114+03');
INSERT INTO public.notifications VALUES ('3f21a6d0-64d9-4aac-9833-fa35e3bc1d5a', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'Ticket Submitted Successfully', 'Your incident TKT-000016 ("Core Banking Terminal disconnected from LAN") has been registered and is pending triage.', 'TICKET_CREATED', true, '2026-09-21 15:25:42.13+03', '2026-09-21 15:29:31.114+03');
INSERT INTO public.notifications VALUES ('c5022b08-ac33-4a31-bac1-0f1520a75741', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'd0605b97-7ba3-459d-8dd3-4ca437421d6d', 'Ticket Submitted Successfully', 'Your incident TKT-000015 ("Branch Passbook / Receipt Printer Paper Feed Malfunction") has been registered and is pending triage.', 'TICKET_CREATED', true, '2026-09-18 11:39:03.272+03', '2026-09-21 15:29:31.114+03');
INSERT INTO public.notifications VALUES ('5bfb8c4e-d62f-4d63-b0c2-47cda08e81cb', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'Incident Resolved', 'Your ticket TKT-000014 has been resolved: Resolved the error by connecting with correct cables', 'TICKET_RESOLVED', true, '2026-09-18 11:27:34.311+03', '2026-09-21 15:29:31.114+03');
INSERT INTO public.notifications VALUES ('cafdc16a-ba04-4a5e-8189-df500793880d', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'Work in Progress', 'Technician has begun working on your ticket TKT-000014.', 'STATUS_CHANGED', true, '2026-09-18 11:26:49.822+03', '2026-09-21 15:29:31.114+03');
INSERT INTO public.notifications VALUES ('f8d51983-146d-44b4-a0e8-8cc366fd2789', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'Technician Assigned', 'An IS support technician has been assigned to investigate your incident TKT-000014.', 'TICKET_ASSIGNED', true, '2026-09-18 11:26:26.472+03', '2026-09-21 15:29:31.114+03');
INSERT INTO public.notifications VALUES ('382bdf3a-f7d1-4cfd-84fd-152d5ce4ab7c', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'Ticket Submitted Successfully', 'Your incident TKT-000014 ("My pc does not work") has been registered and is pending triage.', 'TICKET_CREATED', true, '2026-09-18 11:25:03.281+03', '2026-09-21 15:29:31.114+03');
INSERT INTO public.notifications VALUES ('6f8d1ca4-0c91-459e-9e22-f39a21fa4d90', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'Ticket TKT-000016 RESOLVED', 'Ticket TKT-000016 was marked as RESOLVED (Replaced the damaged wires).', 'TICKET_RESOLVED', true, '2026-09-21 15:29:00.473+03', '2026-09-21 15:39:18.076+03');


--
-- Data for Name: ticket_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ticket_assignments VALUES ('e4ab352e-b286-453c-8501-c1cae4d97ea1', '39366b23-a976-4aa2-891b-e1d0bcec7b51', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-09-14 23:53:21.884+03', NULL, true, NULL);
INSERT INTO public.ticket_assignments VALUES ('1d9c2841-410d-4200-9958-dc8577ff8941', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-09-15 09:39:18.496+03', NULL, true, NULL);
INSERT INTO public.ticket_assignments VALUES ('ac754140-b494-4a48-8187-93a49587bd1f', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-09-18 11:26:26.426+03', NULL, true, NULL);
INSERT INTO public.ticket_assignments VALUES ('9a80fa11-ae66-487d-b52a-054b6d531db6', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-09-21 15:26:45.936+03', NULL, true, NULL);


--
-- Data for Name: ticket_comments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ticket_comments VALUES ('c2298c4c-7534-4235-8590-02815f53ea51', '39366b23-a976-4aa2-891b-e1d0bcec7b51', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Issue Resolved: Replaced the damaged cable', false, '2026-09-15 08:01:50.321+03', '2026-09-15 08:01:50.321+03');
INSERT INTO public.ticket_comments VALUES ('54041475-3c5c-4e0d-9eb0-6900db72239d', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Issue Resolved: I have fixed the issue, now you can use the network safely', false, '2026-09-15 09:40:12.843+03', '2026-09-15 09:40:12.843+03');
INSERT INTO public.ticket_comments VALUES ('64c32954-25b7-4e64-b98b-7ef9362d3a42', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Issue Resolved: Resolved the error by connecting with correct cables', false, '2026-09-18 11:27:34.295+03', '2026-09-18 11:27:34.295+03');
INSERT INTO public.ticket_comments VALUES ('f1f3a6ac-157a-4d29-857f-9f7e005894f0', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Issue Resolved: Replaced the damaged wires', false, '2026-09-21 15:29:00.441+03', '2026-09-21 15:29:00.441+03');


--
-- Data for Name: ticket_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ticket_status_history VALUES ('7738c820-9c63-46a4-afd5-0926726c9a1a', '39366b23-a976-4aa2-891b-e1d0bcec7b51', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'OPEN', '2026-09-14 23:52:27.534+03', 'Ticket submitted by employee');
INSERT INTO public.ticket_status_history VALUES ('87a09b40-f4a2-4cbe-8d1c-b35ffe055527', '39366b23-a976-4aa2-891b-e1d0bcec7b51', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'OPEN', 'ASSIGNED', '2026-09-14 23:53:21.893+03', 'Assigned to technician Tadesse Tech');
INSERT INTO public.ticket_status_history VALUES ('822c7d2d-afd5-438f-bb70-f513fec4af42', '39366b23-a976-4aa2-891b-e1d0bcec7b51', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ASSIGNED', 'IN_PROGRESS', '2026-09-14 23:53:51.029+03', 'Technician commenced diagnostic and troubleshooting work.');
INSERT INTO public.ticket_status_history VALUES ('5d5d2adf-59ce-45ca-a34a-43e479493348', '39366b23-a976-4aa2-891b-e1d0bcec7b51', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IN_PROGRESS', 'RESOLVED', '2026-09-15 08:01:50.313+03', 'Replaced the damaged cable');
INSERT INTO public.ticket_status_history VALUES ('2f0ae9a1-9e3b-46ec-8a68-5c162bf1b28c', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'OPEN', '2026-09-15 09:38:18.457+03', 'Ticket submitted by employee');
INSERT INTO public.ticket_status_history VALUES ('26528f5c-2038-44a5-88b7-0062c149c437', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'OPEN', 'ASSIGNED', '2026-09-15 09:39:18.52+03', 'Assigned to technician Tadesse Tech');
INSERT INTO public.ticket_status_history VALUES ('3bb77a71-6651-4ed2-b143-d6183ad71232', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ASSIGNED', 'IN_PROGRESS', '2026-09-15 09:39:48.403+03', 'Technician commenced diagnostic and troubleshooting work.');
INSERT INTO public.ticket_status_history VALUES ('b801186b-5c4b-4add-ba33-7c015449d277', '1a6b0dba-dddd-41cc-a18b-65b67e72481d', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IN_PROGRESS', 'RESOLVED', '2026-09-15 09:40:12.838+03', 'I have fixed the issue, now you can use the network safely');
INSERT INTO public.ticket_status_history VALUES ('e72c6ca6-08f3-46e5-a2e0-9e83f02a8c48', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'OPEN', '2026-09-18 11:25:03.266+03', 'Ticket submitted by employee');
INSERT INTO public.ticket_status_history VALUES ('4938093a-864d-4292-8a78-d37ba31fa27a', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'OPEN', 'ASSIGNED', '2026-09-18 11:26:26.451+03', 'Assigned to technician Tadesse Tech');
INSERT INTO public.ticket_status_history VALUES ('f71741a1-9fe8-4cb0-be62-bac2ba55808d', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ASSIGNED', 'IN_PROGRESS', '2026-09-18 11:26:49.809+03', 'Technician commenced diagnostic and troubleshooting work.');
INSERT INTO public.ticket_status_history VALUES ('058ed877-1196-4cf6-aeff-54654f17fafb', 'a48c4333-5905-470c-bc54-fc2abbe368cf', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IN_PROGRESS', 'RESOLVED', '2026-09-18 11:27:34.289+03', 'Resolved the error by connecting with correct cables');
INSERT INTO public.ticket_status_history VALUES ('20d8ae02-bc96-4a18-b9d7-4a3a94d59ff4', 'd0605b97-7ba3-459d-8dd3-4ca437421d6d', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'OPEN', '2026-09-18 11:39:03.261+03', 'Ticket submitted by employee');
INSERT INTO public.ticket_status_history VALUES ('1235feb5-3767-4c6e-9470-1439e69a7ddd', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'OPEN', '2026-09-21 15:25:42.114+03', 'Ticket submitted by employee');
INSERT INTO public.ticket_status_history VALUES ('2e6f4fc3-c89d-4ced-ae5f-19f9e7001659', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'OPEN', 'ASSIGNED', '2026-09-21 15:26:45.969+03', 'Assigned to technician Tadesse Tech');
INSERT INTO public.ticket_status_history VALUES ('eb6b4986-48e8-4b11-ab75-379c77b7235a', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ASSIGNED', 'IN_PROGRESS', '2026-09-21 15:27:56.104+03', 'Technician commenced diagnostic and troubleshooting work.');
INSERT INTO public.ticket_status_history VALUES ('bc4cdf00-3c15-4ce7-a184-25c0f9d6f46e', '5763137f-fdb7-4bb5-9836-08ae25125e19', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IN_PROGRESS', 'RESOLVED', '2026-09-21 15:29:00.436+03', 'Replaced the damaged wires');


--
-- Name: ticket_number_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_number_seq', 16, true);


--
-- PostgreSQL database dump complete
--


