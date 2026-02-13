
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Users, Gift, TrendingUp, Search } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Assuming supabase client is here

// Types (Move to separate types file if needed)
interface ReferralProgram {
    id: string;
    name: string;
    user_type: 'rider' | 'driver';
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    rewards_config: any;
    created_at: string;
}

interface ReferralStat {
    id: string;
    referrer_email: string;
    referee_email: string;
    status: string;
    created_at: string;
}

export default function Referrals() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const queryClient = useQueryClient();

    // Fetch Programs
    const { data: programs, isLoading: isLoadingPrograms } = useQuery({
        queryKey: ['referralPrograms'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('referral_programs')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as ReferralProgram[];
        }
    });

    // Fetch Stats (Mock for now, or real query if we had stats table ready)
    const { data: stats } = useQuery({
        queryKey: ['referralStats'],
        queryFn: async () => {
            // Complex join usually needed here, simplifying for direct select
            const { data, error } = await supabase
                .from('referrals')
                .select(`
            id,
            status,
            created_at,
            referrer:referrer_id (email, phone),
            referee:referee_id (email, phone)
        `)
                .limit(50);
            if (error) throw error;
            return data;
        }
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (newProgram: any) => {
            // Call backend API instead of direct DB to use the controller validation logic?
            // Or direct Supabase since this is admin panel.
            const { data, error } = await supabase
                .from('referral_programs')
                .insert(newProgram)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['referralPrograms'] });
            setIsCreateOpen(false);
            toast.success("Program created successfully");
        },
        onError: (err: any) => {
            toast.error("Failed: " + err.message);
        }
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        // Simplistic form handler
        const newProgram = {
            name: formData.get('name'),
            user_type: formData.get('user_type'),
            start_date: formData.get('start_date') || null,
            end_date: formData.get('end_date') || null,
            is_active: true,
            rewards_config: { type: 'standard', amount: 50 } // Hardcoded for demo
        };

        createMutation.mutate(newProgram);
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Referrals & Rewards</h1>
                    <p className="text-muted-foreground">Manage referral programs and track performance.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Create Program
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Referral Program</DialogTitle>
                            <DialogDescription>Setup a new referral campaign for riders or drivers.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Program Name</Label>
                                <Input id="name" name="name" placeholder="Summer Rider Promo" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="user_type">Target Audience</Label>
                                <Select name="user_type" defaultValue="rider">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rider">Riders</SelectItem>
                                        <SelectItem value="driver">Drivers</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input id="start_date" name="start_date" type="date" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input id="end_date" name="end_date" type="date" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Program</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rewards Issued</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">EGP 4,250</div>
                        <p className="text-xs text-muted-foreground">Total payout</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24%</div>
                        <p className="text-xs text-muted-foreground">Signups to 1st Trip</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="programs" className="w-full">
                <TabsList>
                    <TabsTrigger value="programs">Active Programs</TabsTrigger>
                    <TabsTrigger value="referrals">Referral Audit</TabsTrigger>
                </TabsList>

                <TabsContent value="programs" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Programs</CardTitle>
                            <CardDescription>List of all active and inactive referral campaigns.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {programs?.map((program) => (
                                        <TableRow key={program.id}>
                                            <TableCell className="font-medium">{program.name}</TableCell>
                                            <TableCell className="capitalize">{program.user_type}</TableCell>
                                            <TableCell>
                                                <Badge variant={program.is_active ? "default" : "secondary"}>
                                                    {program.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(program.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="referrals" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Referral History</CardTitle>
                                    <CardDescription>Real-time log of referral events.</CardDescription>
                                </div>
                                <div className="flex w-full max-w-sm items-center space-x-2">
                                    <Input type="email" placeholder="Search by email..." />
                                    <Button type="submit" size="icon" variant="ghost"><Search className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Referrer</TableHead>
                                        <TableHead>Referee</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats?.map((ref: any) => (
                                        <TableRow key={ref.id}>
                                            <TableCell>{ref.referrer?.phone || 'Unknown'}</TableCell>
                                            <TableCell>{ref.referee?.phone || 'Unknown'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{ref.status}</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(ref.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
