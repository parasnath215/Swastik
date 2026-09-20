"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const prisma_1 = __importDefault(require("./prisma"));
// Check every 15 minutes (900000 ms)
const CHECK_INTERVAL = 900000;
// Add 24 hours if overdue
const EXTENSION_HOURS = 24;
const EXTENSION_MINUTES = EXTENSION_HOURS * 60;
const EXTENSION_MS = EXTENSION_MINUTES * 60000;
const startCronJobs = () => {
    console.log('Task extension cron job started.');
    setInterval(async () => {
        try {
            const now = new Date();
            // Find tasks where endTime < now and the phase is not ACCEPTED
            const overdueTasks = await prisma_1.default.task.findMany({
                where: {
                    endTime: { lt: now },
                    phase: {
                        status: { not: 'ACCEPTED' }
                    }
                },
                include: { machine: true }
            });
            if (overdueTasks.length === 0)
                return;
            for (const task of overdueTasks) {
                let newDuration = task.duration + EXTENSION_MINUTES;
                let newEndTime = new Date(task.endTime.getTime() + EXTENSION_MS);
                // Auto-compute actual cost based on duration
                const machineCost = (newDuration / 60) * (task.machine?.hourlyRate || 0);
                // Fetch material cost if there is a material attached
                let materialCost = 0;
                if (task.materialId) {
                    const material = await prisma_1.default.material.findUnique({ where: { id: task.materialId } });
                    materialCost = material?.unitCost || 0;
                }
                const actualCost = machineCost + materialCost;
                await prisma_1.default.task.update({
                    where: { id: task.id },
                    data: {
                        endTime: newEndTime,
                        duration: newDuration,
                        actualCost
                    }
                });
                // Sync expected duration back to matching PhaseResources
                const newDurationInHours = Math.round(newDuration / 60);
                await prisma_1.default.phaseResource.updateMany({
                    where: {
                        phaseId: task.phaseId,
                        OR: [
                            { machineId: task.machineId },
                            { processId: task.processId }
                        ]
                    },
                    data: {
                        expectedDuration: newDurationInHours
                    }
                });
            }
            console.log(`Automatically extended ${overdueTasks.length} overdue tasks by ${EXTENSION_HOURS} hours.`);
        }
        catch (err) {
            console.error('Error in task extension cron job:', err);
        }
    }, CHECK_INTERVAL);
};
exports.startCronJobs = startCronJobs;
