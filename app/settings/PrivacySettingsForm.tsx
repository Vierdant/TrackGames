"use client";

import { Field, Select } from "@/app/components/ui/Inputs";
import type { User } from "@/lib/types";
import { useState } from "react";

export default function PrivacySettingsForm({ profile }: { profile: User }) {
    const [profilePrivacy, setProfilePrivacy] = useState(profile.privacy);
    const [libraryPrivacy, setLibraryPrivacy] = useState(profile.libraryPrivacy);
    const [logsPrivacy, setLogsPrivacy] = useState(profile.logsPrivacy);
    const [activityPrivacy, setActivityPrivacy] = useState(profile.activityPrivacy);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Field label="Profile visibility">
                <Select name="privacy" value={profilePrivacy} onChange={(event) => setProfilePrivacy(event.target.value)} className="w-full">
                    <option value="public">Public</option>
                    <option value="followers">Followers only</option>
                    <option value="private">Private</option>
                </Select>
            </Field>
            <Field label="Library visibility">
                <Select name="libraryPrivacy" value={libraryPrivacy} onChange={(event) => setLibraryPrivacy(event.target.value)} className="w-full">
                    <option value="public">Public</option>
                    <option value="followers">Followers only</option>
                    <option value="private">Private</option>
                </Select>
            </Field>
            <Field label="Play log visibility">
                <Select name="logsPrivacy" value={logsPrivacy} onChange={(event) => setLogsPrivacy(event.target.value)} className="w-full">
                    <option value="public">Public</option>
                    <option value="followers">Followers only</option>
                    <option value="private">Private</option>
                </Select>
            </Field>
            <Field label="Activity visibility">
                <Select name="activityPrivacy" value={activityPrivacy} onChange={(event) => setActivityPrivacy(event.target.value)} className="w-full">
                    <option value="public">Public</option>
                    <option value="followers">Followers only</option>
                    <option value="private">Private</option>
                </Select>
            </Field>
        </div>
    );
}
