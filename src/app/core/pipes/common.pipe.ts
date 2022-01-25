import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'calDate' })
export class pipeCalDate implements PipeTransform {
    transform(value: string): string {
        const date = new Date(value);
        const today = new Date();
        const timeAgo = Math.round(Math.abs(today.getTime() - date.getTime()) / (1000)) || 0;
        if (timeAgo > (60 * 60 * 24)) {
            return Math.round(timeAgo / (60 * 60 * 24)) + ' day';
        }
        if (timeAgo > (60 * 60)) {
            return Math.round(timeAgo / (60 * 60)) + 'h';
        }

        if (timeAgo > 60) {
            return Math.round(timeAgo / 60) + 'm';
        }
        return timeAgo + 's';
    }
}
