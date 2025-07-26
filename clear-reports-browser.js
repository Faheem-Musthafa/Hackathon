// Copy and paste this script into your browser console when on the reports page

// Function to clear all reports from the UI
function clearAllReportsFromUI() {
  console.log('🗑️  Clearing all reports from UI...');
  
  // Find all report cards and remove them
  const reportCards = document.querySelectorAll('[class*="hover:shadow-lg"]');
  console.log(`Found ${reportCards.length} report cards to remove`);
  
  reportCards.forEach((card, index) => {
    card.remove();
    console.log(`Removed report ${index + 1}`);
  });
  
  // Update the reports count
  const countElement = document.querySelector('p[class*="text-muted-foreground"]');
  if (countElement) {
    countElement.textContent = '0 of 0 reports';
  }
  
  // Show success message
  const successMessage = document.createElement('div');
  successMessage.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ✅ All reports cleared from view!
    </div>
  `;
  document.body.appendChild(successMessage);
  
  // Remove the message after 3 seconds
  setTimeout(() => {
    successMessage.remove();
  }, 3000);
  
  console.log('✅ All reports cleared from UI');
}

// Function to try to clear reports from database
async function clearAllReportsFromDatabase() {
  console.log('🗑️  Attempting to clear reports from database...');
  
  const SUPABASE_URL = "https://cnqewaajpwejnmsahtqe.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucWV3YWFqcHdlam5tc2FodHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MzAwODYsImV4cCI6MjA2OTAwNjA4Nn0.OODJxLZ88JStvLcuR4jWZqOaSQeGoiCBYnjK9zxoBkY";
  
  try {
    // Create Supabase client
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get all reports
    const { data: reports, error: fetchError } = await supabase
      .from('reports')
      .select('id, title');
    
    if (fetchError) {
      console.error('❌ Error fetching reports:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${reports.length} reports to clear`);
    
    // Try to update all reports to 'deleted' status
    let successCount = 0;
    for (const report of reports) {
      try {
        const { error: updateError } = await supabase
          .from('reports')
          .update({ 
            status: 'deleted',
            title: `[DELETED] ${report.title}`,
            description: '[This report has been deleted]'
          })
          .eq('id', report.id);
        
        if (updateError) {
          console.log(`❌ Failed to mark "${report.title}" as deleted: ${updateError.message}`);
        } else {
          console.log(`✅ Marked as deleted: ${report.title}`);
          successCount++;
        }
      } catch (error) {
        console.log(`❌ Error marking "${report.title}" as deleted: ${error.message}`);
      }
    }
    
    console.log(`📊 Database update summary: ${successCount}/${reports.length} reports marked as deleted`);
    
  } catch (error) {
    console.error('❌ Error with database operation:', error);
  }
}

// Run both functions
console.log('🚀 Starting report clearing process...');
clearAllReportsFromUI();
clearAllReportsFromDatabase();

// Instructions for manual clearing
console.log(`
📋 Manual Clearing Instructions:
1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the 'reports' table
4. Select all rows and delete them
5. Or update all status fields to 'deleted'
`); 