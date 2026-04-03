import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Client, ClientInsert, useCreateClient, useUpdateClient } from '@/hooks/useClients';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientFormDialog({ open, onOpenChange, client }: Props) {
  const isEdit = !!client;
  const create = useCreateClient();
  const update = useUpdateClient();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [slug, setSlug] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setCity(client.city);
      setSlug(client.slug);
      setActive(client.status === 'active');
    } else {
      setName('');
      setCity('');
      setSlug('');
      setActive(true);
    }
  }, [client, open]);

  const generateSlug = (value: string) =>
    value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit) setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !slug) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: client!.id, name, city, slug, status: active ? 'active' : 'blocked' });
        toast.success('Cliente atualizado');
      } else {
        await create.mutateAsync({ name, city, slug, status: active ? 'active' : 'blocked' });
        toast.success('Cliente criado');
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    }
  };

  const loading = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Laboratório Exemplo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo, SP" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="laboratorio-exemplo" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="status">Status ativo</Label>
            <Switch id="status" checked={active} onCheckedChange={setActive} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
