-- =====================================================
-- TRIGGER: validate_discount_code
-- =====================================================
-- Descripción: Valida la consistencia de los campos de descuento
-- Tabla: discount_codes
-- =====================================================

create or replace function validate_discount_code()
returns trigger
language plpgsql
as $$
begin
  if new.type = 'PERCENT' then
    if new.value_percent is null or new.value_cents is not null then
      raise exception 'PERCENT requires value_percent and forbids value_cents';
    end if;
  elsif new.type = 'FIXED' then
    if new.value_cents is null or new.value_percent is not null then
      raise exception 'FIXED requires value_cents and forbids value_percent';
    end if;
  elsif new.type = 'FREE_SHIPPING' then
    if new.value_cents is not null or new.value_percent is not null then
      raise exception 'FREE_SHIPPING forbids value_*';
    end if;
  end if;
  return new;
end;
$$;

-- Crear trigger
drop trigger if exists validate_discount_code_trigger on discount_codes;
create trigger validate_discount_code_trigger
  before insert or update on discount_codes
  for each row execute function validate_discount_code();
