import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { CirclePlus } from 'lucide-react';
import { useState } from 'react';

type Group = {
  id: string;
  name: string;
};

type TaskInput = {
  title: string;
  description?: string;
  dueDate?: string;
  groupId: string;
};

export default function AddTaskDialog({
  groups,
  onSubmit,
}: {
  groups: Group[];
  onSubmit: (task: TaskInput) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, description, dueDate, groupId });
    handleClose();
  };

  return (
    <>
      <div onClick={handleOpen} className="flex items-center gap-2">
        {' '}
        <CirclePlus /> New task
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Task Group"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            margin="normal"
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
