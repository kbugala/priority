var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Interview API",
        Version = "v1",
        Description = "Priority Software Interview Assignment API"
    });
});

// Add CORS policy to allow frontend to call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Services
builder.Services.AddSingleton<InterviewApi.Services.ICustomerService, InterviewApi.Services.CustomerService>();
builder.Services.AddSingleton<InterviewApi.Services.IHotelService, InterviewApi.Services.HotelService>();
builder.Services.AddSingleton<InterviewApi.Services.IVisitationService, InterviewApi.Services.VisitationService>();

var app = builder.Build();

// CORS must be the first middleware — before routing/swagger/endpoints
app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Interview API v1");
        options.RoutePrefix = "swagger";
    });

    // Redirect root → Swagger UI in development
    app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
}

// Map controllers
app.MapControllers();

app.Run();
