import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../types';
import { toast } from 'sonner';

// Import shadcn/ui components
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";

interface GamesListProps {
  games: Game[];
  isLoading: boolean;
  onDeleteGame?: (id: string) => Promise<void>;
}

export function GamesList({ games, isLoading, onDeleteGame }: GamesListProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter games based on search query
  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle game deletion
  const handleDelete = async () => {
    if (!gameToDelete || !onDeleteGame) return;
    
    try {
      setIsDeleting(true);
      await onDeleteGame(gameToDelete.id);
      toast.success(`Game "${gameToDelete.title}" deleted successfully`);
      setGameToDelete(null);
    } catch (error) {
      toast.error('Failed to delete game');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Navigate to game detail page
  const navigateToGame = (id: string) => {
    navigate(`/games/${id}`);
  };

  // Loading skeleton view
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="border rounded-md">
          <div className="h-12 border-b px-4 py-3 flex items-center">
            <Skeleton className="h-4 w-full" />
          </div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="px-4 py-4 border-b flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-8 w-[100px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => navigate('/games/new')}>Add New Game</Button>
      </div>

      <Table>
        <TableCaption>A list of all games in the system.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGames.length > 0 ? (
            filteredGames.map(game => (
              <TableRow 
                key={game.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigateToGame(game.id)}
              >
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell>{game.provider}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {game.category.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={game.isActive ? "success" : "destructive"}>
                    {game.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Info
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">{game.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {game.description || 'No description available.'}
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                              <span className="text-sm">Release Date:</span>
                              <span className="col-span-2 text-sm">
                                {new Date(game.releaseDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/games/${game.id}/edit`)}
                    >
                      Edit
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setGameToDelete(game)}
                        >
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Delete Game</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{gameToDelete?.title}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setGameToDelete(null)}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                No games found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default GamesList;