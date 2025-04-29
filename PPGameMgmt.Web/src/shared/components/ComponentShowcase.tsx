import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Switch } from '../../components/ui/switch';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from '../../components/ui/accordion';
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '../../components/ui/command';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem
} from '../../components/ui/dropdown-menu';
import { useToast, ToastProvider } from '../../components/ui/toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

// Demo component to show toast notifications
const ToastDemo = () => {
  const { addToast } = useToast();

  const showToast = (type: "default" | "success" | "info" | "warning" | "error") => {
    addToast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      description: `This is a ${type} toast notification example.`,
      type,
      duration: 3000
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => showToast('default')}>Default Toast</Button>
      <Button variant="outline" onClick={() => showToast('success')}>Success Toast</Button>
      <Button variant="outline" onClick={() => showToast('info')}>Info Toast</Button>
      <Button variant="outline" onClick={() => showToast('warning')}>Warning Toast</Button>
      <Button variant="outline" onClick={() => showToast('error')}>Error Toast</Button>
    </div>
  );
};

// Main component showcase
const ComponentShowcase: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'orange', label: 'Orange' },
    { value: 'grape', label: 'Grape' },
  ];

  return (
    <ToastProvider>
      <div className={darkMode ? 'dark' : ''}>
        <div className="p-6 bg-background text-foreground min-h-screen">
          <h1 className="text-3xl font-bold mb-6">Component Library Showcase</h1>
          
          <div className="flex items-center gap-2 mb-6">
            <span>Dark Mode</span>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar Component</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                
                <Avatar>
                  <AvatarImage src="/broken-image.jpg" alt="Broken Image" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                
                <Avatar>
                  <AvatarFallback>PP</AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>
            
            {/* Accordion Example */}
            <Card>
              <CardHeader>
                <CardTitle>Accordion Component</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It comes with default styles that match your theme.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It's animated by default, but you can disable it if needed.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            {/* Command Component */}
            <Card>
              <CardHeader>
                <CardTitle>Command Component</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <Button onClick={() => setCommandOpen(true)}>Open Command Menu</Button>
                </div>
                
                {commandOpen && (
                  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setCommandOpen(false)}>
                    <div className="bg-popover rounded-lg shadow-lg w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      <Command className="rounded-lg border shadow-md">
                        <CommandInput placeholder="Type a command or search..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup heading="Suggestions">
                            {fruits.map((fruit) => (
                              <CommandItem key={fruit.value} onSelect={() => {
                                alert(`Selected: ${fruit.label}`);
                                setCommandOpen(false);
                              }}>
                                {fruit.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Dropdown Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Dropdown Menu Component</CardTitle>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2">
                    Open Menu
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Notifications</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
            
            {/* Toast Component */}
            <Card>
              <CardHeader>
                <CardTitle>Toast Component</CardTitle>
              </CardHeader>
              <CardContent>
                <ToastDemo />
              </CardContent>
            </Card>
            
            {/* Switch Component */}
            <Card>
              <CardHeader>
                <CardTitle>Switch Component</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <Switch label="Default Switch" />
                  <Switch label="Checked Switch" defaultChecked />
                  <Switch 
                    label="With Description"
                    description="This is a helpful description"
                  />
                  <Switch label="Disabled Switch" disabled />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
};

export default ComponentShowcase;