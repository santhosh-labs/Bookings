import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Globe, Lock, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventTypePropertiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceName: string;
}

export default function EventTypePropertiesModal({ isOpen, onClose, serviceName }: EventTypePropertiesModalProps) {
    const [defaultTimeZone, setDefaultTimeZone] = useState("customer");
    const [displayTimeZones, setDisplayTimeZones] = useState("all");
    const [confirmationPage, setConfirmationPage] = useState("zoho");
    const [buttonText, setButtonText] = useState("Book another appointment");
    const [includeAutoAssign, setIncludeAutoAssign] = useState(true);

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-lg">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                                        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                            <Dialog.Title className="text-xl font-bold text-slate-900">
                                                Event Type Properties
                                            </Dialog.Title>
                                            <button
                                                type="button"
                                                className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all outline-none"
                                                onClick={onClose}
                                            >
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>

                                        <div className="flex-1 px-6 py-8 space-y-10">
                                            {/* Time Zone Section */}
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between group">
                                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Time Zone</h3>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Eye className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                </div>

                                                <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 space-y-6">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-sm font-bold text-slate-600">Default Time Zone</Label>
                                                            <Lock className="w-3.5 h-3.5 text-slate-300" />
                                                        </div>
                                                        <Select value={defaultTimeZone} onValueChange={setDefaultTimeZone}>
                                                            <SelectTrigger className="h-11 bg-white rounded-xl border-slate-200">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="customer">Customer's local time zone</SelectItem>
                                                                <SelectItem value="host">Host's local time zone</SelectItem>
                                                                <SelectItem value="fixed">Fixed time zone (UTC)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-bold text-slate-600">Time Zones to display</Label>
                                                        <Select value={displayTimeZones} onValueChange={setDisplayTimeZones}>
                                                            <SelectTrigger className="h-11 bg-white rounded-xl border-slate-200">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Timezones</SelectItem>
                                                                <SelectItem value="preferred">Popular Timezones only</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Booking Confirmation Section */}
                                            <div className="space-y-6">
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Booking Confirmation Page</h3>
                                                <div className="space-y-3">
                                                    <Select value={confirmationPage} onValueChange={setConfirmationPage}>
                                                        <SelectTrigger className="h-11 bg-white rounded-xl border-slate-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="zoho">Show Zoho Bookings' confirmation page</SelectItem>
                                                            <SelectItem value="custom">Redirect to a custom URL</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Button Text Section */}
                                            <div className="space-y-6 group">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Button Text on Confirmation Page</h3>
                                                    <Eye className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <Input 
                                                    value={buttonText} 
                                                    onChange={(e) => setButtonText(e.target.value)}
                                                    className="h-11 bg-white rounded-xl border-slate-200"
                                                />
                                            </div>

                                            {/* Recruiter Selection */}
                                            <div className="space-y-6 group">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recruiter Selection</h3>
                                                    <Eye className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Checkbox 
                                                        id="auto-assign" 
                                                        checked={includeAutoAssign}
                                                        onCheckedChange={(checked) => setIncludeAutoAssign(checked as boolean)}
                                                        className="w-5 h-5 border-slate-300 data-[state=checked]:bg-[#5E48B8] data-[state=checked]:border-[#5E48B8]"
                                                    />
                                                    <Label htmlFor="auto-assign" className="text-sm font-medium text-slate-600 cursor-pointer">
                                                        Include "Auto-assign Recruiter" in the Recruiters list
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 py-6 border-t border-slate-100 flex items-center gap-3 sticky bottom-0 bg-white">
                                            <Button 
                                                className="flex-1 h-11 bg-[#5E48B8] hover:bg-[#4C3A96] text-white font-bold rounded-xl"
                                                onClick={onClose}
                                            >
                                                Save
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 h-11 border-slate-200 text-slate-600 font-bold rounded-xl"
                                                onClick={onClose}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
