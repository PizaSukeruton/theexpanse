// File: backend/TSE/PerformanceMonitor.js

class PerformanceMonitor {
    constructor(pool) {
        if (!pool) {
            throw new Error('Database pool is required for PerformanceMonitor.');
        }
        this.pool = pool;
        this.hexCounter = null; // Initialize from database query
        this.isMonitoring = false; // Flag for internal monitoring status
        this.resourceTiers = {
            tier1: { allocation: 0.50, priority: 'critical', hex_range: '#800000-#AFFFFF' }, // 50% TSE Loop
            tier2: { allocation: 0.30, priority: 'high', hex_range: '#B00000-#BFFFFF' },    // 30% Real-time
            tier3: { allocation: 0.20, priority: 'medium', hex_range: '#C00000-#FFFFFF' }   // 20% Batch
        };
    }

    /**
     * Initializes the hexCounter for PerformanceMonitor, ensuring it starts
     * from the #C00000 range and continues from the highest existing ID.
     */
    async initializeCounters() {
        try {
            // Query for the highest existing metric_id within the #C hex range
            const result = await this.pool.query(`
                SELECT metric_id FROM tse_performance_metrics 
                WHERE metric_id LIKE '#C%'
                ORDER BY metric_id DESC LIMIT 1
            `);

            // Extract the numerical part after '#C' and increment, or start from 0x00000
            this.hexCounter = result.rows.length > 0 ?
                parseInt(result.rows[0].metric_id.substring(2), 16) + 1 :
                0x00000; // Start from #C00000 (0x00000 for the 5-digit part)

            console.log(`PerformanceMonitor hex counter initialized at: #C` + this.hexCounter.toString(16).toUpperCase().padStart(5, '0'));

        } catch (error) {
            console.error('PerformanceMonitor: Failed to initialize hex counters:', error);
            throw error;
        }
    }

    /**
     * Generates a new unique hex ID for performance metrics within the #C range.
     * Ensures the hexCounter is initialized before use.
     * @returns {string} A new hex ID in '#CXXXXX' format.
     */
    _generateMetricHexId() {
        if (this.hexCounter === null) {
            // Fallback initialization if initializeCounters wasn't called (should be on app startup)
            console.warn('PerformanceMonitor: Hex counter not initialized. Initializing with default #C00000.');
            this.hexCounter = 0x00000;
        }
        const newHexId = '#C' + this.hexCounter.toString(16).toUpperCase().padStart(5, '0');
        this.hexCounter++; // Increment for the next use
        return newHexId;
    }

    /**
     * Begins performance tracking. Sets an internal flag.
     * Note: Does not set up a setInterval as global monitoring is handled externally.
     */
    async startMonitoring() {
        this.isMonitoring = true;
        console.log('PerformanceMonitor: Monitoring started.');
    }

    /**
     * Stops performance tracking. Resets an internal flag.
     */
    async stopMonitoring() {
        this.isMonitoring = false;
        console.log('PerformanceMonitor: Monitoring stopped.');
    }

    /**
     * Captures current Node.js process system metrics.
     * This method focuses on the performance of the Node.js application process itself.
     * @returns {Object} An object containing captured metrics.
     */
    async captureMetrics() {
        try {
            // Capture system metrics using Node.js process object
            const cpuUsage = process.cpuUsage();
            const memoryUsage = process.memoryUsage();

            const metrics = {
                timestamp: new Date().toISOString(),
                cpu_user_ms: cpuUsage.user / 1000, // Convert microseconds to milliseconds
                cpu_system_ms: cpuUsage.system / 1000, // Convert microseconds to milliseconds
                memory_rss_mb: Math.round(memoryUsage.rss / (1024 * 1024)), // Resident Set Size
                memory_heap_total_mb: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
                memory_heap_used_mb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
                uptime_seconds: process.uptime(),
                active_handles: process._getActiveHandles ? process._getActiveHandles().length : null, // _getActiveHandles is internal and might not exist
                active_requests: process._getActiveRequests ? process._getActiveRequests().length : null // _getActiveRequests is internal and might not exist
            };

            console.log('PerformanceMonitor: Captured process metrics.');
            return metrics;
        } catch (error) {
            console.error('PerformanceMonitor: Failed to capture metrics:', error);
            throw error;
        }
    }

    /**
     * Records any general performance metric to the tse_performance_metrics table.
     * @param {Object} data - Metric data to record.
     * @param {string} data.metric_type - Type of metric (e.g., 'cpu_usage', 'memory_usage', 'throughput').
     * @param {number} data.metric_value - The numerical value of the metric.
     * @param {string} [data.metric_unit=''] - Unit of the metric (e.g., 'percent', 'mb', 'ops_per_second').
     * @param {string} [data.cycle_id=null] - Optional hex ID of the TSE cycle this metric relates to.
     * @param {string} [data.resource_tier=null] - The resource tier ('tier1', 'tier2', 'tier3').
     * @param {number} [data.resource_allocation_percent=null] - Percentage of resource allocated.
     * @param {number} [data.cpu_usage=null] - CPU usage percentage at time of metric.
     * @param {number} [data.memory_usage_mb=null] - Memory usage in MB at time of metric.
     * @param {number} [data.gpu_usage=null] - GPU usage percentage.
     * @param {number} [data.throughput_ops_per_second=null] - Operations per second.
     * @param {number} [data.latency_ms=null] - Response latency in milliseconds.
     * @param {number} [data.error_rate=null] - Error rate (0.0 to 1.0).
     * @returns {Object} The recorded metric record.
     */
    async recordPerformanceMetrics(data) {
        try {
            if (!data.metric_type || data.metric_value === undefined) {
                throw new Error('PerformanceMonitor: Missing required metric_type or metric_value for recording performance metrics.');
            }

            const metric_id = this._generateMetricHexId();

            const result = await this.pool.query(`
                INSERT INTO tse_performance_metrics (
                    metric_id, cycle_id, metric_type, metric_value, metric_unit,
                    resource_tier, resource_allocation_percent, cpu_usage,
                    memory_usage_mb, gpu_usage, throughput_ops_per_second,
                    latency_ms, error_rate, timestamp
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
                RETURNING *
            `, [
                metric_id,
                data.cycle_id || null,
                data.metric_type,
                data.metric_value,
                data.metric_unit || null,
                data.resource_tier || null,
                data.resource_allocation_percent || null,
                data.cpu_usage || null,
                data.memory_usage_mb || null,
                data.gpu_usage || null,
                data.throughput_ops_per_second || null,
                data.latency_ms || null,
                data.error_rate || null
            ]);

            console.log(`PerformanceMonitor: Recorded metric ${data.metric_type} with ID ${metric_id}`);
            return result.rows[0];

        } catch (error) {
            console.error('PerformanceMonitor: Failed to record performance metrics:', error);
            throw error;
        }
    }

    /**
     * Gets the current summed allocation percentage for a specific resource tier.
     * Considers allocations within the last 5 minutes.
     * @param {string} tier - The resource tier ('tier1', 'tier2', 'tier3').
     * @returns {number} The current total allocation percentage for the tier.
     */
    async getCurrentResourceUsage(tier) {
        try {
            // Sums both positive 'resource_allocation' and negative 'resource_release' values
            const result = await this.pool.query(`
                SELECT COALESCE(SUM(resource_allocation_percent), 0) as total_allocation
                FROM tse_performance_metrics
                WHERE resource_tier = $1
                AND (metric_type = 'resource_allocation' OR metric_type = 'resource_release')
                AND timestamp >= NOW() - INTERVAL '5 minutes'
            `, [tier]);

            return parseFloat(result.rows[0].total_allocation);
        } catch (error) {
            console.error(`PerformanceMonitor: Failed to get current resource usage for ${tier}:`, error);
            throw error;
        }
    }

    /**
     * Attempts to allocate Tier 1 resources and records the allocation.
     * Enforces the 50% limit for Tier 1.
     * @param {Object} data - Allocation request data.
     * @param {string} data.cycle_id - The TSE cycle ID requesting resources.
     * @param {number} data.requested_allocation - The percentage (0.0 to 1.0) of Tier 1 to request.
     * @param {number} [data.current_cpu_usage=null] - Current CPU usage at time of request.
     * @param {number} [data.current_memory_mb=null] - Current memory usage in MB at time of request.
     * @param {number} [data.expected_throughput=null] - Expected operations per second.
     * @returns {Object} The recorded allocation metric.
     */
    async allocateTier1Resources(data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            if (data.requested_allocation === undefined || data.requested_allocation <= 0) {
                throw new Error('PerformanceMonitor: Requested allocation must be a positive number.');
            }
            if (!data.cycle_id) {
                throw new Error('PerformanceMonitor: cycle_id is required for resource allocation.');
            }

            const tierLimit = this.resourceTiers.tier1.allocation; // 0.50

            // Check current allocation
            const currentAllocationPercent = await this.getCurrentResourceUsage('tier1'); // This is already in percentage (0-100)

            // Convert requested_allocation (0.0-1.0) to percentage (0-100) for comparison
            const requestedAllocationPercent = data.requested_allocation * 100;

            if ((currentAllocationPercent + requestedAllocationPercent) > (tierLimit * 100)) {
                throw new Error(`PerformanceMonitor: Tier 1 resource limit exceeded. Current net usage: ${currentAllocationPercent.toFixed(2)}%, requested: ${requestedAllocationPercent.toFixed(2)}%, max: ${(tierLimit * 100).toFixed(2)}%`);
            }

            // Record allocation
            const recordedMetric = await this.recordPerformanceMetrics({
                cycle_id: data.cycle_id,
                metric_type: 'resource_allocation',
                metric_value: requestedAllocationPercent, // Store as percentage 0-100
                metric_unit: 'percent',
                resource_tier: 'tier1',
                resource_allocation_percent: requestedAllocationPercent, // Store as percentage 0-100
                cpu_usage: data.current_cpu_usage || null,
                memory_usage_mb: data.current_memory_mb || null,
                throughput_ops_per_second: data.expected_throughput || null
            });

            await client.query('COMMIT');
            console.log(`PerformanceMonitor: Allocated ${requestedAllocationPercent.toFixed(2)}% of Tier 1 resources for cycle ${data.cycle_id}.`);
            return recordedMetric;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('PerformanceMonitor: Failed to allocate Tier 1 resources:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Releases previously allocated Tier 1 resources by recording a 'resource_release' metric.
     * The negative value in `resource_allocation_percent` allows for accurate net allocation
     * tracking when summed with positive allocation metrics in compliance checks.
     * @param {Object} data - Release request data.
     * @param {string} data.cycle_id - The TSE cycle ID releasing resources.
     * @param {number} data.released_allocation - The percentage (0.0 to 1.0) of Tier 1 being released.
     * @returns {Object} The recorded release metric.
     */
    async releaseTier1Resources(data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            if (data.released_allocation === undefined || data.released_allocation <= 0) {
                throw new Error('PerformanceMonitor: Released allocation must be a positive number.');
            }
            if (!data.cycle_id) {
                throw new Error('PerformanceMonitor: cycle_id is required for resource release.');
            }

            const releasedAllocationPercent = data.released_allocation * 100;

            // Record the resource release event. The negative value here is crucial
            // for the `SUM(resource_allocation_percent)` in compliance checks
            // to accurately reflect the net allocated resources.
            const recordedMetric = await this.recordPerformanceMetrics({
                cycle_id: data.cycle_id,
                metric_type: 'resource_release', // Indicates a release event
                metric_value: releasedAllocationPercent, // Stores the positive amount released
                metric_unit: 'percent',
                resource_tier: 'tier1',
                resource_allocation_percent: -releasedAllocationPercent, // Negative to indicate reduction from total allocation
                cpu_usage: data.current_cpu_usage || null,
                memory_usage_mb: data.current_memory_mb || null
            });

            await client.query('COMMIT');
            console.log(`PerformanceMonitor: Released ${releasedAllocationPercent.toFixed(2)}% of Tier 1 resources for cycle ${data.cycle_id}.`);
            return recordedMetric;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('PerformanceMonitor: Failed to release Tier 1 resources:', error);
            throw error;
        } finally {
            client.release();
        }
    }


    /**
     * Verifies current resource allocation against defined limits for all tiers.
     * @returns {Object} An object indicating compliance status and any alerts.
     */
    async checkResourceCompliance() {
        try {
            // Get current resource usage for all tiers within the last 5 minutes
            const usageQuery = `
                SELECT 
                    resource_tier,
                    SUM(resource_allocation_percent) as total_allocation,
                    AVG(cpu_usage) as avg_cpu,
                    AVG(memory_usage_mb) as avg_memory,
                    COUNT(*) as active_allocations
                FROM tse_performance_metrics 
                WHERE timestamp >= NOW() - INTERVAL '5 minutes'
                AND (metric_type = 'resource_allocation' OR metric_type = 'resource_release')
                GROUP BY resource_tier
            `;

            const result = await this.pool.query(usageQuery);

            const compliance = {
                tier1_compliant: true,
                tier2_compliant: true,
                tier3_compliant: true,
                alerts: [],
                current_usage: {}
            };

            // Initialize all tiers to 0 if no records found for them
            ['tier1', 'tier2', 'tier3'].forEach(tier => {
                compliance.current_usage[tier] = 0;
            });

            result.rows.forEach(row => {
                const tier = row.resource_tier;
                // row.total_allocation is already the net sum in percentage (0-100)
                const totalAllocation = parseFloat(row.total_allocation);
                const tierLimit = this.resourceTiers[tier].allocation * 100; // Convert limit to percentage

                compliance.current_usage[tier] = totalAllocation;

                if (totalAllocation > tierLimit) {
                    compliance[`${tier}_compliant`] = false;
                    compliance.alerts.push(
                        `${tier.toUpperCase()} over limit: ${totalAllocation.toFixed(2)}% (max: ${tierLimit.toFixed(2)}%)`
                    );
                }
            });

            console.log('PerformanceMonitor: Resource compliance checked.');
            return compliance;

        } catch (error) {
            console.error('PerformanceMonitor: Compliance check failed:', error);
            throw error;
        }
    }

    /**
     * Returns system performance health statistics from the database.
     * @returns {Object} Database-derived performance health metrics.
     */
    async getPerformanceHealth() {
        try {
            const result = await this.pool.query(`
                SELECT
                    (SELECT COUNT(*) FROM tse_performance_metrics WHERE metric_type = 'resource_allocation') AS total_allocations_recorded,
                    (SELECT COUNT(*) FROM tse_performance_metrics WHERE metric_type = 'resource_release') AS total_releases_recorded,
                    (SELECT AVG(cpu_usage) FROM tse_performance_metrics WHERE timestamp >= NOW() - INTERVAL '1 hour' AND cpu_usage IS NOT NULL) AS avg_cpu_last_hour,
                    (SELECT AVG(memory_usage_mb) FROM tse_performance_metrics WHERE timestamp >= NOW() - INTERVAL '1 hour' AND memory_usage_mb IS NOT NULL) AS avg_memory_last_hour_mb,
                    (SELECT MAX(timestamp) FROM tse_performance_metrics) AS last_metric_timestamp;
            `);

            const healthData = result.rows[0];
            const compliance = await this.checkResourceCompliance(); // Also include compliance in health check

            console.log('PerformanceMonitor: System performance health retrieved.');
            return {
                status: 'operational',
                database_connected: true,
                ...healthData,
                resource_compliance: compliance,
                // Display the current hexCounter value, formatted as the next ID to be generated, without incrementing.
                current_hex_counter: this.hexCounter !== null ? 
                                     '#C' + (this.hexCounter).toString(16).toUpperCase().padStart(5, '0') : 
                                     'not_initialized'
            };

        } catch (error) {
            console.error('PerformanceMonitor: Failed to get system performance health:', error);
            return {
                status: 'degraded',
                database_connected: false,
                error: error.message
            };
        }
    }
}

export default PerformanceMonitor;
