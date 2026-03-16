import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigError } from './supabaseClient';

type Task = {
  id: string;
  title: string;
  notes: string | null;
  done: boolean;
  created_at: string;
};

const ORDER_OPTIONS = [
  { value: 'created_desc', label: 'Mais recentes' },
  { value: 'created_asc', label: 'Mais antigas' },
  { value: 'done_first', label: 'Concluídas primeiro' },
  { value: 'pending_first', label: 'Pendentes primeiro' },
] as const;

type OrderOption = (typeof ORDER_OPTIONS)[number]['value'];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [filterDone, setFilterDone] = useState<'all' | 'done' | 'pending'>('all');
  const [orderBy, setOrderBy] = useState<OrderOption>('created_desc');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(supabaseConfigError);

  async function fetchTasks() {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setIsLoading(false);
      return;
    }

    setTasks(data ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    void fetchTasks();

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          void fetchTasks();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      if (filterDone === 'done') return task.done;
      if (filterDone === 'pending') return !task.done;
      return true;
    });

    if (orderBy === 'created_asc') {
      return [...filtered].sort((a, b) => a.created_at.localeCompare(b.created_at));
    }

    if (orderBy === 'done_first') {
      return [...filtered].sort((a, b) => Number(b.done) - Number(a.done));
    }

    if (orderBy === 'pending_first') {
      return [...filtered].sort((a, b) => Number(a.done) - Number(b.done));
    }

    return filtered;
  }, [tasks, filterDone, orderBy]);

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !supabase) return;

    setIsSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from('tasks').insert({
      title: title.trim(),
      notes: notes.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    setTitle('');
    setNotes('');
    setIsSaving(false);
  }

  async function toggleTaskDone(task: Task) {
    if (!supabase) return;

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ done: !task.done })
      .eq('id', task.id);

    if (updateError) {
      setError(updateError.message);
    }
  }

  async function deleteTask(taskId: string) {
    if (!supabase) return;

    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', taskId);

    if (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="container">
      <header>
        <h1>📝 Tarefas do Dia</h1>
        <p>Organize as tarefas do seu dia a dia com sincronização em tempo real via Supabase.</p>
      </header>

      {supabaseConfigError ? (
        <section className="card">
          <h2>Conectar Supabase</h2>
          <p className="error">{supabaseConfigError}</p>
          <ol>
            <li>Copie `.env.example` para `.env`.</li>
            <li>Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.</li>
            <li>Reinicie o servidor (`npm run dev`).</li>
          </ol>
        </section>
      ) : null}

      <section className="card">
        <h2>Nova tarefa</h2>
        <form onSubmit={handleCreateTask} className="task-form">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Fazer exercícios"
            required
            disabled={!supabase}
          />
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anotações (opcional)"
            rows={3}
            disabled={!supabase}
          />
          <button disabled={isSaving || !supabase} type="submit">
            {isSaving ? 'Salvando...' : 'Adicionar tarefa'}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="filters">
          <label>
            Status
            <select
              value={filterDone}
              onChange={(event) => setFilterDone(event.target.value as typeof filterDone)}
              disabled={!supabase}
            >
              <option value="all">Todas</option>
              <option value="pending">Pendentes</option>
              <option value="done">Concluídas</option>
            </select>
          </label>

          <label>
            Ordenação
            <select value={orderBy} onChange={(event) => setOrderBy(event.target.value as OrderOption)} disabled={!supabase}>
              {ORDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="error">Erro: {error}</p> : null}

        {isLoading ? <p>Carregando tarefas...</p> : null}

        {!isLoading && visibleTasks.length === 0 ? (
          <p>Nenhuma tarefa encontrada.</p>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li key={task.id} className={task.done ? 'done' : ''}>
                <div>
                  <h3>{task.title}</h3>
                  {task.notes ? <p>{task.notes}</p> : null}
                  <small>{new Date(task.created_at).toLocaleString('pt-BR')}</small>
                </div>
                <div className="actions">
                  <button onClick={() => void toggleTaskDone(task)} disabled={!supabase}>
                    {task.done ? 'Reabrir' : 'Concluir'}
                  </button>
                  <button className="danger" onClick={() => void deleteTask(task.id)} disabled={!supabase}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
