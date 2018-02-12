
--
-- Name: saved; Type: TABLE; Schema: public; Owner: -
--
CREATE SEQUENCE public.saved_saved_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;

CREATE TABLE saved (
    saved_id bigint NOT NULL DEFAULT nextval('saved_saved_id_seq'::regclass),
    user_id integer NOT NULL,
    name text,
    data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    user_id integer NOT NULL,
    name text,
    email text,
    shadow boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    subscribed boolean DEFAULT false,
    email_verified boolean DEFAULT false
);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: saved_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY saved
    ADD CONSTRAINT saved_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- PostgreSQL database dump complete
--

