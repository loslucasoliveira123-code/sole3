CREATE TABLE public.casais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT 'Nosso casal',
  criado_por uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.casal_membros (
  casal_id uuid NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  user_id uuid NOT NULL UNIQUE,
  nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (casal_id, user_id)
);
CREATE TABLE public.convites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  casal_id uuid NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  codigo text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12),'hex'),
  criado_por uuid NOT NULL,
  usado_por uuid,
  usado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  casal_id uuid NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  orcamento numeric(14,2) NOT NULL DEFAULT 0,
  prazo date,
  status text NOT NULL DEFAULT 'Planejamento',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  casal_id uuid NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  criado_por uuid NOT NULL DEFAULT auth.uid(),
  tipo text NOT NULL CHECK (tipo IN ('receita','despesa')),
  titulo text NOT NULL,
  categoria text NOT NULL DEFAULT 'Outros',
  valor numeric(14,2) NOT NULL CHECK (valor > 0),
  data date NOT NULL DEFAULT current_date,
  pagador text NOT NULL DEFAULT 'Casal',
  projeto_id uuid REFERENCES public.projetos(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  casal_id uuid NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  nome text NOT NULL,
  objetivo numeric(14,2) NOT NULL CHECK (objetivo > 0),
  atual numeric(14,2) NOT NULL DEFAULT 0,
  aporte numeric(14,2) NOT NULL DEFAULT 0,
  prazo date,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.casais, public.casal_membros, public.convites, public.projetos, public.lancamentos, public.metas TO authenticated;
GRANT ALL ON public.casais, public.casal_membros, public.convites, public.projetos, public.lancamentos, public.metas TO service_role;

ALTER TABLE public.casais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casal_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_membro(_casal uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.casal_membros WHERE casal_id = _casal AND user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.meu_casal()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _nome text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT casal_id INTO _id FROM public.casal_membros WHERE user_id = auth.uid();
  IF _id IS NOT NULL THEN RETURN _id; END IF;
  SELECT COALESCE(display_name,'') INTO _nome FROM public.profiles WHERE id = auth.uid();
  INSERT INTO public.casais (criado_por) VALUES (auth.uid()) RETURNING id INTO _id;
  INSERT INTO public.casal_membros (casal_id, user_id, nome) VALUES (_id, auth.uid(), COALESCE(_nome,''));
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.aceitar_convite(_codigo text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _c public.convites; _atual uuid; _nome text; _n int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _c FROM public.convites WHERE codigo = _codigo;
  IF _c.id IS NULL THEN RAISE EXCEPTION 'Convite inválido'; END IF;
  SELECT casal_id INTO _atual FROM public.casal_membros WHERE user_id = auth.uid();
  IF _atual = _c.casal_id THEN RETURN _atual; END IF;
  IF _c.usado_por IS NOT NULL THEN RAISE EXCEPTION 'Este convite já foi usado'; END IF;
  SELECT count(*) INTO _n FROM public.casal_membros WHERE casal_id = _c.casal_id;
  IF _n >= 2 THEN RAISE EXCEPTION 'Este casal já está completo'; END IF;
  IF _atual IS NOT NULL THEN
    SELECT count(*) INTO _n FROM public.casal_membros WHERE casal_id = _atual;
    IF _n > 1 THEN RAISE EXCEPTION 'Você já faz parte de outro casal'; END IF;
    DELETE FROM public.casal_membros WHERE user_id = auth.uid();
  END IF;
  SELECT COALESCE(display_name,'') INTO _nome FROM public.profiles WHERE id = auth.uid();
  INSERT INTO public.casal_membros (casal_id, user_id, nome) VALUES (_c.casal_id, auth.uid(), COALESCE(_nome,''));
  UPDATE public.convites SET usado_por = auth.uid(), usado_em = now() WHERE id = _c.id;
  RETURN _c.casal_id;
END $$;

REVOKE EXECUTE ON FUNCTION public.meu_casal() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.aceitar_convite(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.meu_casal() TO authenticated;
GRANT EXECUTE ON FUNCTION public.aceitar_convite(text) TO authenticated;

CREATE POLICY "membros veem casal" ON public.casais FOR SELECT TO authenticated USING (public.is_membro(id));
CREATE POLICY "membros editam casal" ON public.casais FOR UPDATE TO authenticated USING (public.is_membro(id));
CREATE POLICY "membros veem membros" ON public.casal_membros FOR SELECT TO authenticated USING (public.is_membro(casal_id));
CREATE POLICY "editar proprio nome" ON public.casal_membros FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "membros veem convites" ON public.convites FOR SELECT TO authenticated USING (public.is_membro(casal_id));
CREATE POLICY "membros criam convites" ON public.convites FOR INSERT TO authenticated WITH CHECK (public.is_membro(casal_id) AND criado_por = auth.uid() AND usado_por IS NULL);
CREATE POLICY "membros apagam convites" ON public.convites FOR DELETE TO authenticated USING (public.is_membro(casal_id));

CREATE POLICY "casal projetos" ON public.projetos FOR ALL TO authenticated USING (public.is_membro(casal_id)) WITH CHECK (public.is_membro(casal_id));
CREATE POLICY "casal lancamentos" ON public.lancamentos FOR ALL TO authenticated USING (public.is_membro(casal_id)) WITH CHECK (public.is_membro(casal_id));
CREATE POLICY "casal metas" ON public.metas FOR ALL TO authenticated USING (public.is_membro(casal_id)) WITH CHECK (public.is_membro(casal_id));