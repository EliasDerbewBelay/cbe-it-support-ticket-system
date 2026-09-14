import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/reportService';

/**
 * Summary KPI cards for executive dashboard
 * GET /api/reports/summary
 */
export const getSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await reportService.getSummaryMetrics();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ticket breakdown by category
 * GET /api/reports/by-category
 */
export const getByCategory = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const breakdown = await reportService.getTicketsByCategory();

    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ticket volume by department
 * GET /api/reports/by-department
 */
export const getByDepartment = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const breakdown = await reportService.getTicketsByDepartment();

    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Technician workload and performance stats
 * GET /api/reports/by-technician
 */
export const getByTechnician = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workload = await reportService.getTechnicianWorkload();

    res.status(200).json({
      success: true,
      data: workload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * SLA performance and resolution time metrics
 * GET /api/reports/performance
 */
export const getPerformance = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const performance = await reportService.getPerformanceMetrics();

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};
