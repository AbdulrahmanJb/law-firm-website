namespace LawFirm.Infrastructure.Entities;

public class DailyVisit
{
    public int Id { get; set; }
    public DateOnly VisitDate { get; set; }
    public string PagePath { get; set; } = string.Empty;
    public int Count { get; set; }
}
